import { pgTable, uuid, text, integer, index } from "drizzle-orm/pg-core";
import { timestamps } from "@server/db/utils";
import { relations } from "drizzle-orm";
import { videoAssets } from "./video_assets";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const videoTechnicalMetadatas = pgTable(
  "video_technical_metadatas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => videoAssets.id, { onDelete: "cascade" }),

    size: integer("size"),
    duration: integer("duration"),
    aspectRatio: text("aspect_ratio"),
    resolution: text("resolution"),
    thumbnailUrl: text("thumbnail_url"),
    width: integer("width"),
    height: integer("height"),
    videoCodec: text("video_codec"),
    audioCodec: text("audio_codec"),
    fps: integer("fps"),
    bitrate: integer("bitrate"),
    audioChannels: integer("audio_channels"),
    audioSampleRate: integer("audio_sample_rate"),
    ...timestamps,
  },
  (table) => {
    return {
      videoTechnicalMetadataIdIdx: index("idx_video_technical_metadata_id").on(
        table.id
      ),
      assetIdIdx: index("idx_video_technical_metadata_asset_id").on(
        table.assetId
      ),
    };
  }
);

export const videoTechnicalMetadatasRelations = relations(
  videoTechnicalMetadatas,
  ({ one }) => ({
    videoAsset: one(videoAssets, {
      fields: [videoTechnicalMetadatas.assetId],
      references: [videoAssets.id],
    }),
  })
);

export type VideoTechnicalMetadata = typeof videoTechnicalMetadatas.$inferSelect;
export type NewVideoTechnicalMetadata = typeof videoTechnicalMetadatas.$inferInsert;

export const insertVideoTechnicalMetadataSchema = createInsertSchema(videoTechnicalMetadatas);
export const updateVideoTechnicalMetadataSchema = createUpdateSchema(videoTechnicalMetadatas);
export const selectVideoTechnicalMetadataSchema = createSelectSchema(videoTechnicalMetadatas);
