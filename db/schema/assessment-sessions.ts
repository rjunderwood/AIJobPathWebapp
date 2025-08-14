import { pgTable, text, timestamp, uuid, pgEnum, inet } from "drizzle-orm/pg-core"

export const sessionStatus = pgEnum("session_status", ["in_progress", "completed", "abandoned"])
export const deviceType = pgEnum("device_type", ["mobile", "desktop", "tablet"])

export const assessmentSessions = pgTable("assessment_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  session_id: text("session_id").unique().notNull(),
  user_id: uuid("user_id"), // Will be manually linked to auth.users
  status: sessionStatus("status").default("in_progress"),
  started_at: timestamp("started_at").defaultNow(),
  completed_at: timestamp("completed_at"),
  abandoned_at: timestamp("abandoned_at"),
  conversion_source: text("conversion_source"),
  device_type: deviceType("device_type"),
  browser: text("browser"),
  ip_address: inet("ip_address")
})

export type InsertAssessmentSession = typeof assessmentSessions.$inferInsert
export type SelectAssessmentSession = typeof assessmentSessions.$inferSelect