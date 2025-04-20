import { pgTable, uuid, text, index, pgEnum, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "@server/db/models/users";
import { timestamps } from "@server/db/utils";
import { FEEDBACK_RATINGS } from "@server/lib/constants";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const feedbackRatingEnum = pgEnum("feedback_rating", FEEDBACK_RATINGS);

export const feedbackSubmissions = pgTable(
  "feedback_submissions",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    rating: feedbackRatingEnum("rating").notNull(),
    comment: text("comment"),
    source: text("source").notNull(),
    metadata: text("metadata"), // Optional JSON string for additional context
    ...timestamps,
  },
  (table) => [
    index("idx_feedback_id").on(table.id),
    index("idx_feedback_user_id").on(table.userId),
    check("comment_length", sql`LENGTH(comment) <= 100`),
  ]
);

export const feedbackSubmissionsRelations = relations(
  feedbackSubmissions,
  ({ one }) => ({
    user: one(users, {
      fields: [feedbackSubmissions.userId],
      references: [users.id],
    }),
  })
);

export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
export type NewFeedbackSubmission = typeof feedbackSubmissions.$inferInsert;

export const insertFeedbackSubmissionSchema = createInsertSchema(feedbackSubmissions);
export const updateFeedbackSubmissionSchema = createUpdateSchema(feedbackSubmissions);
export const selectFeedbackSubmissionSchema = createSelectSchema(feedbackSubmissions);
