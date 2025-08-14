import { z } from "zod"

export const AssessmentSchema = z.object({
  major: z.string().min(1).max(100),
  university: z.string().min(1).max(200),
  targetRole: z.string().min(1).max(100),
  graduationYear: z.number().min(2024).max(2030),
  currentSkills: z.array(z.string()).max(20).optional().default([]),
  learningStyle: z.string().optional(),
  timeAvailability: z.string(),
  careerConcerns: z.string().max(500).optional()
})

export const SessionSchema = z.object({
  sessionId: z.string().min(10),
  source: z.string().optional(),
  device: z.enum(["mobile", "desktop", "tablet"]).optional()
})