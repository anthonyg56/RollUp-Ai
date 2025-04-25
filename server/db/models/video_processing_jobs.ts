import { pgEnum, pgTable, uuid, text, index } from "drizzle-orm/pg-core";
import { timestamps } from "@server/db/utils";
import { relations } from "drizzle-orm";
import {
  JOB_PROCESSING_STATUS,
  PROCESS_VIDEO_STEPS,
} from "@server/lib/constants";
import { videoSubmissions } from "./videos_submission";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const jobStatusEnum = pgEnum("job_status", JOB_PROCESSING_STATUS);

export const videoProcessingJobs = pgTable(
  "video_processing_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoSubmissionId: uuid("video_submission_id")
      .notNull()
      .references(() => videoSubmissions.id, { onDelete: "cascade" }),
    jobId: text("job_id").notNull(),
    status: jobStatusEnum("status").notNull().default("added"),
    errorMessage: text("error_message"),
    metadata: text("metadata"),
    ...timestamps,
  },
  (table) => {
    return {
      videoProcessingJobIdIdx: index("idx_video_processing_job_id").on(
        table.id
      ),
      videoSubmissionIdIdx: index("idx_video_processing_job_video_submission_id").on(table.videoSubmissionId),
    };
  }
);

export const videoProcessingJobsRelations = relations(videoProcessingJobs, ({ one }) => ({
  videoSubmission: one(videoSubmissions, {
    fields: [videoProcessingJobs.videoSubmissionId],
    references: [videoSubmissions.id],
  }),
}));

export type VideoProcessingJob = typeof videoProcessingJobs.$inferSelect;
export type NewVideoProcessingJob = typeof videoProcessingJobs.$inferInsert;

export const insertVideoProcessingJobSchema = createInsertSchema(videoProcessingJobs);
export const updateVideoProcessingJobSchema = createUpdateSchema(videoProcessingJobs);
export const selectVideoProcessingJobSchema = createSelectSchema(videoProcessingJobs);
