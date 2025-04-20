import { timestamps } from "@server/db/utils";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const verifications = pgTable("verifications", {
  id: uuid().defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
}, (table) => [
  index("idx_verification_identifier").on(table.identifier),
]);

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export const insertVerificationSchema = createInsertSchema(verifications);
export const updateVerificationSchema = createUpdateSchema(verifications);
export const selectVerificationSchema = createSelectSchema(verifications);