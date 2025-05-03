import { Job } from "bullmq";
import { ProcessNewVideoData } from "./process-new-video/types";

export default async function sendClientUpdate(progress: number, job: Job<ProcessNewVideoData>, message?: string) {
  if (message) {
    await Promise.all([
      job.updateProgress(progress),
      job.updateData({
        ...job.data,
        message,
      }),
    ]);

    return;
  }

  await job.updateProgress(progress);
}
