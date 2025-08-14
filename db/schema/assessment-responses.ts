import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core"
import { assessmentSessions } from "./assessment-sessions"

export const assessmentResponses = pgTable("assessment_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  session_id: uuid("session_id").references(() => assessmentSessions.id).notNull(),
  user_id: uuid("user_id"), // Will be manually linked to auth.users
  major: text("major").notNull(),
  university: text("university").notNull(),
  target_role: text("target_role").notNull(),
  graduation_year: integer("graduation_year").notNull(),
  current_skills: text("current_skills").array(),
  learning_style: text("learning_style"),
  time_availability: text("time_availability"),
  career_concerns: text("career_concerns"),
  additional_context: jsonb("additional_context"),
  created_at: timestamp("created_at").defaultNow()
})

export type InsertAssessmentResponse = typeof assessmentResponses.$inferInsert
export type SelectAssessmentResponse = typeof assessmentResponses.$inferSelect