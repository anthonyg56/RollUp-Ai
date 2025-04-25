import {
  pgTable,
  uuid,
  text,
  varchar,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { timestamps } from "@server/db/utils";
import {
  TRANSCRIPTION_FORMATS,
  TRANSCRIPTION_SOURCES,
} from "@server/lib/constants";
import { relations } from "drizzle-orm";
import { videoTranscriptSegments } from "@server/db/models/video_transcript_segments";
import { videoAssets } from "./video_assets";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const transcriptionFormatEnum = pgEnum("transcription_format", TRANSCRIPTION_FORMATS);
export const transcriptionSourceEnum = pgEnum("transcription_source", TRANSCRIPTION_SOURCES);

export const videoTranscripts = pgTable("video_transcripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => videoAssets.id, { onDelete: "cascade" }),

  language: varchar("language", { length: 10 }).notNull().default("en"),
  fullText: text("full_text"),
  format: transcriptionFormatEnum("format").notNull().default("plain"),
  source: transcriptionSourceEnum("source").notNull().default("whisper"),

  ...timestamps,
}, (table) => {
  return {
    transcriptIdIdx: index("idx_transcript_id").on(table.id),
    assetIdIdx: index("idx_transcriptions_asset_id").on(table.assetId),
  };
}
);

export const videoTranscriptsRelations = relations(videoTranscripts, ({ many, one }) => ({
  videoSegments: many(videoTranscriptSegments),
  videoAsset: one(videoAssets, {
    fields: [videoTranscripts.assetId],
    references: [videoAssets.id],
  }),
}));

export type VideoTranscript = typeof videoTranscripts.$inferSelect;
export type NewVideoTranscript = typeof videoTranscripts.$inferInsert;

export const insertVideoTranscriptSchema = createInsertSchema(videoTranscripts);
export const updateVideoTranscriptSchema = createUpdateSchema(videoTranscripts);
export const selectVideoTranscriptSchema = createSelectSchema(videoTranscripts);
