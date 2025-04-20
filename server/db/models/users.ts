import { pgTable, uuid, text, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { onboardingSurveys } from "@server/db/models/onboarding_surveys";
import { sessions } from "@server/db/models/sessions";
import { accounts } from "@server/db/models/accounts";
import { errorLogs } from "@server/db/models/error_logs";
import { timestamps } from "@server/db/utils";
import { videoSubmissions } from "@server/db/models/videos_submission";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image").notNull().default("/default-avatar.png"),
    showOnboardingSurvey: boolean("show_onboarding_survey"),
    showWelcomeTour: boolean("show_welcome_tour"),
    ...timestamps,
  },
  (table) => [
    index("idx_user_id").on(table.id),
    index("idx_user_email").on(table.email),
  ]
);

export const userRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  errorLogs: many(errorLogs),
  videoSubmissions: many(videoSubmissions),
  onboardingSurveys: one(onboardingSurveys),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertUserSchema = createInsertSchema(users);
export const updateUserSchema = createUpdateSchema(users);
export const selectUserSchema = createSelectSchema(users);
