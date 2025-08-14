import { pgTable, uuid, text, jsonb, timestamp, inet } from "drizzle-orm/pg-core"

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  session_id: text("session_id").notNull(),
  user_id: uuid("user_id"), // Will be manually linked to auth.users
  event_name: text("event_name").notNull(),
  event_properties: jsonb("event_properties"),
  page_path: text("page_path"),
  referrer: text("referrer"),
  timestamp: timestamp("timestamp").defaultNow(),
  ip_address: inet("ip_address"),
  user_agent: text("user_agent")
})

export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert
export type SelectAnalyticsEvent = typeof analyticsEvents.$inferSelect