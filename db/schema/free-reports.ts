import { pgTable, uuid, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core"

export const freeReports = pgTable("free_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  major: text("major").notNull().unique(), // One report per major
  report_data: jsonb("report_data").notNull(),
  ai_tokens_used: integer("ai_tokens_used"),
  generation_time_ms: integer("generation_time_ms"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
})

export type InsertFreeReport = typeof freeReports.$inferInsert
export type SelectFreeReport = typeof freeReports.$inferSelect