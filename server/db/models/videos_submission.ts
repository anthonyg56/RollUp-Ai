import { integer, pgEnum } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { timestamps } from "@server/db/utils";
import { VIDEO_CATEGORIES } from "@server/lib/constants";
import { videoAssets } from "@server/db/models/video_assets";
import { pgTable, uuid, text, boolean, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const videoCategoryEnum = pgEnum("video_category", VIDEO_CATEGORIES);

export const videoSubmissions = pgTable(
  "video_submissions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description"),
    autoGenerateCaptions: boolean("auto_generate_captions")
      .notNull()
      .default(true),
    autoGenerateBroll: boolean("auto_generate_broll").notNull().default(true),
    category: videoCategoryEnum("category").notNull().default("Other"),
    tags: text("tags").array(),

    ...timestamps,
  },
  (table) => {
    return {
      videoIdIdx: index("idx_video_id").on(table.id),
      userIdIdx: index("idx_video_submission_user_id").on(table.userId),
    };
  }
);

export const videoSubmissionsRelations = relations(videoSubmissions, ({ many }) => ({
  videoAssets: many(videoAssets),
}));

export type VideoSubmission = typeof videoSubmissions.$inferSelect;
export type NewVideoSubmission = typeof videoSubmissions.$inferInsert;

export const insertVideoSubmissionSchema = createInsertSchema(videoSubmissions);
export const updateVideoSubmissionSchema = createUpdateSchema(videoSubmissions);
export const selectVideoSubmissionSchema = createSelectSchema(videoSubmissions);
