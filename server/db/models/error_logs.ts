import { relations } from "drizzle-orm";

import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "@server/db/models/users";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const errorLogs = pgTable(
  "error_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id"),
    component: text("component"),
    operation: text("operation"),
    entityId: text("entity_id"), // Could be videoId, userId, etc.
    entityType: text("entity_type"), // 'video', 'user', etc.
    errorMessage: text("error_message").notNull(),
    errorStack: text("error_stack"),
    severity: text("severity").default("error").notNull(), // 'info', 'warning', 'error', 'critical'
    metadata: jsonb("metadata"), // Additional context data
    status: text("status").default("unresolved").notNull(), // 'unresolved', 'in_progress', 'resolved', 'ignored'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => [
    index("idx_error_logs_id").on(table.id),
    index("idx_error_logs_user_id").on(table.userId),
  ]
);

export const errorLogsRelations = relations(errorLogs, ({ one }) => ({
  user: one(users, {
    fields: [errorLogs.userId],
    references: [users.id],
  }),
}));

export type ErrorLog = typeof errorLogs.$inferSelect;
export type NewErrorLog = typeof errorLogs.$inferInsert;

export const insertErrorLogSchema = createInsertSchema(errorLogs);
export const updateErrorLogSchema = createUpdateSchema(errorLogs);
export const selectErrorLogSchema = createSelectSchema(errorLogs);
