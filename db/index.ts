import { config } from "dotenv"
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { customers } from "./schema/customers"
import { profiles } from "./schema/profiles"
import { assessmentSessions } from "./schema/assessment-sessions"
import { assessmentResponses } from "./schema/assessment-responses"
import { previews } from "./schema/previews"
import { reports } from "./schema/reports"
import { payments } from "./schema/payments"
import { analyticsEvents } from "./schema/analytics-events"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}

const dbSchema = {
  // tables
  customers,
  profiles,
  assessmentSessions,
  assessmentResponses,
  previews,
  reports,
  payments,
  analyticsEvents
  // relations
}

function initializeDb(url: string) {
  const client = postgres(url, { prepare: false })
  return drizzlePostgres(client, { schema: dbSchema })
}

export const db = initializeDb(databaseUrl)
