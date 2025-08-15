import { pgTable, uuid, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core"
import { assessmentResponses } from "./assessment-responses"

export const premiumPrompts = pgTable("premium_prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(), // Will be manually linked to auth.users
  response_id: uuid("response_id").references(() => assessmentResponses.id).notNull(),
  prompts_data: jsonb("prompts_data").notNull(),
  ai_tokens_used: integer("ai_tokens_used"),
  generation_time_ms: integer("generation_time_ms"),
  created_at: timestamp("created_at").defaultNow(),
  generated_at: timestamp("generated_at").defaultNow()
})

export type InsertPremiumPrompts = typeof premiumPrompts.$inferInsert
export type SelectPremiumPrompts = typeof premiumPrompts.$inferSelect