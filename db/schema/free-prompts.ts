import { pgTable, uuid, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core"

export const freePrompts = pgTable("free_prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  major: text("major").notNull().unique(), // One set of prompts per major
  prompts_data: jsonb("prompts_data").notNull(),
  ai_tokens_used: integer("ai_tokens_used"),
  generation_time_ms: integer("generation_time_ms"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
})

export type InsertFreePrompts = typeof freePrompts.$inferInsert
export type SelectFreePrompts = typeof freePrompts.$inferSelect