import { pgTable, uuid, text, timestamp, inet } from "drizzle-orm/pg-core"

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // Will be manually linked to auth.users
  email: text("email").unique().notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  stripe_customer_id: text("stripe_customer_id"),
  utm_source: text("utm_source"),
  utm_medium: text("utm_medium"),
  utm_campaign: text("utm_campaign"),
  referral_code: text("referral_code"),
  ip_address: inet("ip_address"),
  user_agent: text("user_agent")
})

export type InsertProfile = typeof profiles.$inferInsert
export type SelectProfile = typeof profiles.$inferSelect