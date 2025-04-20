import { pgTable, uuid, text, index, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "@server/db/models/users";
import { timestamps } from "@server/db/utils";
import { SURVEY_INDUSTRIES, SURVEY_REFERRAL_SOURCES } from "@server/lib/constants";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const referralSourceEnum = pgEnum(
  "referral_source",
  SURVEY_REFERRAL_SOURCES
);

export const industryEnum = pgEnum("industry", SURVEY_INDUSTRIES);

export const onboardingSurveys = pgTable(
  "onboarding_surveys",
  {
    // keys
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "no action" })
      .notNull(),

    // Survey questions
    productName: text("product_name"),
    industry: industryEnum("industry"),
    otherIndustry: text("other_industry"),
    signupReason: text("signup_reason"),
    otherReferralSource: text("other_referral_source"),
    usedSimilar: boolean("used_similar").default(false),
    referralSource: referralSourceEnum("referral_source"),

    ...timestamps,
  },
  (table) => [
    index("idx_onboarding_survey_id").on(table.id),
    index("idx_onboarding_survey_user_id").on(table.userId),
  ]
);

export const onboardingSurveysRelations = relations(
  onboardingSurveys,
  ({ one }) => ({
    user: one(users, {
      fields: [onboardingSurveys.userId],
      references: [users.id],
    }),
  })
);

export type OnboardingSurvey = typeof onboardingSurveys.$inferSelect;
export type NewOnboardingSurvey = typeof onboardingSurveys.$inferInsert;

export const insertOnboardingSurveySchema = createInsertSchema(onboardingSurveys);
export const updateOnboardingSurveySchema = createUpdateSchema(onboardingSurveys);
export const selectOnboardingSurveySchema = createSelectSchema(onboardingSurveys);
