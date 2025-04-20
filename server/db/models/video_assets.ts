import { pgEnum, pgTable, uuid, text, index } from "drizzle-orm/pg-core";
import { videoSubmissions } from "@server/db/models/videos_submission";
import { timestamps } from "@server/db/utils";
import { relations } from "drizzle-orm";
import { VIDEO_ASSET_TYPES } from "@server/lib/constants";
import { videoProcessingJobs } from "./video_processing_jobs";
import { videoTranscripts } from "./video_transcripts";
import { videoTechnicalMetadatas } from "./video_technical_metadatas";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const assetTypeEnum = pgEnum("asset_type", VIDEO_ASSET_TYPES);

export const videoAssets = pgTable(
  "video_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoSubmissionId: uuid("video_submission_id")
      .notNull()
      .references(() => videoSubmissions.id, { onDelete: "cascade" }),

    assetType: assetTypeEnum("asset_type").notNull(),
    r2ETag: text("e_tag").notNull(),
    r2Key: text("r2_key").notNull(),

    ...timestamps,
  },
  (table) => {
    return {
      videoAssetIdIdx: index("idx_video_asset_id").on(table.id),
      videoSubmissionIdIdx: index("idx_video_asset_video_submission_id").on(table.videoSubmissionId),
    };
  }
);

export const videoAssetsRelations = relations(videoAssets, ({ one, many }) => ({
  videoSubmissions: one(videoSubmissions, {
    fields: [videoAssets.videoSubmissionId],
    references: [videoSubmissions.id],
  }),
  videoTranscripts: one(videoTranscripts, {
    fields: [videoAssets.id],
    references: [videoTranscripts.assetId],
  }),
  videoTechnicalMetadatas: one(videoTechnicalMetadatas, {
    fields: [videoAssets.id],
    references: [videoTechnicalMetadatas.assetId],
  }),
  videoProcessingJobs: many(videoProcessingJobs, {
    relationName: "videoProcessingJobs",
  }),
}));

export type VideoAsset = typeof videoAssets.$inferSelect;
export type NewVideoAsset = typeof videoAssets.$inferInsert;

export const insertVideoAssetSchema = createInsertSchema(videoAssets);
export const updateVideoAssetSchema = createUpdateSchema(videoAssets);
export const selectVideoAssetSchema = createSelectSchema(videoAssets);
