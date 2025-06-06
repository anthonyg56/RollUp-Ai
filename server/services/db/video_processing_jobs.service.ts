import { videoProcessingJobs } from "@server/db/models";
import type { NewVideoProcessingJob, VideoProcessingJob } from "@server/db/models";
import db from "@server/db";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { JobProcessingStatus } from "@server/lib/constants";
import { ProcessVideoStep } from "@server/queues/process-new-video/queue-names";

export async function insertJob(job: NewVideoProcessingJob) {
  const jobAlreadyExists = await db
    .select()
    .from(videoProcessingJobs)
    .where(eq(videoProcessingJobs.jobId, job.jobId));

  if (jobAlreadyExists.length > 0) {
    throw new HTTPException(400, {
      message: "Job already exists",
      cause: new Error("Job already exists"),
    });
  };

  const insertedJob = await db
    .insert(videoProcessingJobs)
    .values(job)
    .returning({
      id: videoProcessingJobs.id,
    });

  return insertedJob[0] ?? null;
}

export async function updateJobStatus(jobId: string, status: JobProcessingStatus, step: ProcessVideoStep) {
  let query = db
    .update(videoProcessingJobs)
    .set({ status, step, ...(status === "failed" && { failedReason: "Job failed" }) })
    .where(eq(videoProcessingJobs.id, jobId));

  const updatedJob = await query
    .returning({
      id: videoProcessingJobs.id,
    });

  return updatedJob[0] ?? null;
}