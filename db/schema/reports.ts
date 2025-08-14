import { pgTable, uuid, text, jsonb, integer, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { assessmentResponses } from "./assessment-responses"

export const reportStatus = pgEnum("report_status", ["pending", "generating", "completed", "failed"])

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(), // Will be manually linked to auth.users
  response_id: uuid("response_id").references(() => assessmentResponses.id),
  status: reportStatus("status").default("pending"),
  report_data: jsonb("report_data"),
  pdf_url: text("pdf_url"),
  ai_tokens_used: integer("ai_tokens_used"),
  generation_time_ms: integer("generation_time_ms"),
  created_at: timestamp("created_at").defaultNow(),
  generated_at: timestamp("generated_at")
})

export type InsertReport = typeof reports.$inferInsert
export type SelectReport = typeof reports.$inferSelect