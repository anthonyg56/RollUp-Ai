import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "@server/db/models/users";
import { timestamps } from "@server/db/utils";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid().defaultRandom().primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    activeOrganizationId: text("active_organization_id"),
    ...timestamps,
  },
  (table) => [
    index("idx_session_id").on(table.id),
    index("idx_session_token").on(table.token),
    index("idx_session_user_id").on(table.userId),
  ]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export const insertSessionSchema = createInsertSchema(sessions);
export const updateSessionSchema = createUpdateSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);
