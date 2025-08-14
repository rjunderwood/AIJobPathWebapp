import { pgTable, uuid, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { assessmentSessions } from "./assessment-sessions"
import { reports } from "./reports"

export const paymentStatus = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"])

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(), // Will be manually linked to auth.users
  session_id: uuid("session_id").references(() => assessmentSessions.id),
  report_id: uuid("report_id").references(() => reports.id),
  stripe_session_id: text("stripe_session_id").unique(),
  stripe_payment_intent_id: text("stripe_payment_intent_id"),
  status: paymentStatus("status").default("pending"),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("usd"),
  created_at: timestamp("created_at").defaultNow(),
  completed_at: timestamp("completed_at"),
  failure_reason: text("failure_reason")
})

export type InsertPayment = typeof payments.$inferInsert
export type SelectPayment = typeof payments.$inferSelect