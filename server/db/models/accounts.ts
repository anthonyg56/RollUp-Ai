import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "@server/db/models/users";
import { timestamps } from "@server/db/utils";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid().defaultRandom().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),

    // Account details
    username: text("username"), // Username on the platform
    displayName: text("display_name"), // Display name on the platform
    profileUrl: text("profile_url"), // URL to the user's profile
    avatarUrl: text("avatar_url"), // URL to the user's avatar

    ...timestamps,
  },
  (table) => [
    index("idx_account_id").on(table.id),
    index("idx_account_user_id").on(table.userId),
  ]
);

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export const insertAccountSchema = createInsertSchema(accounts);
export const updateAccountSchema = createUpdateSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);
