import {
  pgTable,
  uuid,
  text,
  decimal,
  index,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timestamps } from "@server/db/utils";
import { videoTranscripts } from "./video_transcripts";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const videoTranscriptSegments = pgTable(
  "video_transcript_segments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transcriptionId: uuid("transcription_id")
      .notNull()
      .references(() => videoTranscripts.id, { onDelete: "cascade" }),
    startTime: decimal("start_time", { precision: 10, scale: 3 }).notNull(),
    endTime: decimal("end_time", { precision: 10, scale: 3 }).notNull(),
    text: text("text").notNull(),
    speaker: varchar("speaker", { length: 100 }),
    sequenceNumber: integer("sequence_number").notNull(),
    confidence: decimal("confidence", { precision: 5, scale: 4 }),
    ...timestamps,
  },
  (table) => {
    return {
      transcriptSegmentIdIdx: index("idx_transcript_segment_id").on(table.id),
      transcriptionIdIdx: index(
        "idx_transcription_segments_transcription_id"
      ).on(table.transcriptionId),
      timeIdx: index("idx_transcription_segments_time").on(
        table.startTime,
        table.endTime
      ),
    };
  }
);

export const videoTranscriptSegmentsRelations = relations(
  videoTranscriptSegments,
  ({ one }) => ({
    transcription: one(videoTranscripts, {
      fields: [videoTranscriptSegments.transcriptionId],
      references: [videoTranscripts.id],
    }),
  })
);

export type VideoTranscriptSegment = typeof videoTranscriptSegments.$inferSelect;
export type NewVideoTranscriptSegment = typeof videoTranscriptSegments.$inferInsert;

export const insertVideoTranscriptSegmentSchema = createInsertSchema(videoTranscriptSegments);
export const updateVideoTranscriptSegmentSchema = createUpdateSchema(videoTranscriptSegments);
export const selectVideoTranscriptSegmentSchema = createSelectSchema(videoTranscriptSegments);
