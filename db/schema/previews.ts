import { pgTable, uuid, jsonb, integer, timestamp } from "drizzle-orm/pg-core"
import { assessmentSessions } from "./assessment-sessions"
import { assessmentResponses } from "./assessment-responses"

export const previews = pgTable("previews", {
  id: uuid("id").defaultRandom().primaryKey(),
  session_id: uuid("session_id").references(() => assessmentSessions.id),
  response_id: uuid("response_id").references(() => assessmentResponses.id),
  preview_data: jsonb("preview_data").notNull(),
  ai_tokens_used: integer("ai_tokens_used"),
  generation_time_ms: integer("generation_time_ms"),
  created_at: timestamp("created_at").defaultNow()
})

export type InsertPreview = typeof previews.$inferInsert
export type SelectPreview = typeof previews.$inferSelect