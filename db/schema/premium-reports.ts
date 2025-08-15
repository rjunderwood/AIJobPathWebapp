import { pgTable, uuid, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core"
import { assessmentResponses } from "./assessment-responses"

export const premiumReports = pgTable("premium_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(), // Will be manually linked to auth.users
  response_id: uuid("response_id").references(() => assessmentResponses.id).notNull(),
  report_data: jsonb("report_data").notNull(),
  pdf_url: text("pdf_url"),
  ai_tokens_used: integer("ai_tokens_used"),
  generation_time_ms: integer("generation_time_ms"),
  created_at: timestamp("created_at").defaultNow(),
  generated_at: timestamp("generated_at").defaultNow()
})

export type InsertPremiumReport = typeof premiumReports.$inferInsert
export type SelectPremiumReport = typeof premiumReports.$inferSelect