import { pgTable, uuid, text, index, boolean } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { videoAssets } from "./video_assets";
import { relations } from "drizzle-orm";

export const videoThumbnails = pgTable("video_thumbnails", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id").notNull().references(() => videoAssets.id),
  externalId: text("external_id").notNull(),

  requireSignedURLs: boolean("require_signed_urls").default(true),
  filename: text("filename").notNull(),

  ...timestamps,
},
  (t) => ({
    externalIdIdx: index("external_id_idx").on(t.externalId),
  }),
);

export const videoThumbnailsRelations = relations(videoThumbnails, ({ one }) => ({
  asset: one(videoAssets, {
    fields: [videoThumbnails.assetId],
    references: [videoAssets.id],
  }),
}));

export type VideoThumbnails = typeof videoThumbnails.$inferSelect;
export type NewVideoThumbnails = typeof videoThumbnails.$inferInsert;

export const insertVideoThumbnailsSchema = createInsertSchema(videoThumbnails);
export const updateVideoThumbnailsSchema = createUpdateSchema(videoThumbnails);
export const selectVideoThumbnailsSchema = createSelectSchema(videoThumbnails);
