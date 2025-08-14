export type QuestionType = "single-select" | "multi-select" | "text-input" | "range-slider"

export interface AssessmentQuestion {
  id: string
  type: QuestionType
  question: string
  description?: string
  required: boolean
  options?: string[]
  suggestions?: string[] // For autocomplete
  min?: number
  max?: number
  step?: number
  placeholder?: string
  maxLength?: number
  validation?: {
    pattern?: string
    message?: string
  }
}

export interface AssessmentResponse {
  major: string
  university: string
  targetRole: string
  graduationYear: number
  currentSkills: string[]
  learningStyle?: string
  timeAvailability: string
  careerConcerns?: string
}

export interface SkillGap {
  skill: string
  importance: "critical" | "high" | "medium"
  currentLevel: number // 0-10
  requiredLevel: number // 0-10
  timeToLearn: string // e.g., "2-3 months"
  description: string
  resources: {
    type: "course" | "book" | "project" | "certification"
    title: string
    url?: string
    duration?: string
  }[]
}

export interface PreviewData {
  topGaps: SkillGap[] // Top 3 gaps
  overallReadiness: number // 0-100
  estimatedTimeToReady: string // e.g., "6-9 months"
  quickWin: string // One actionable item they can do today
  marketInsight: string // Brief market insight about their role
}

export interface FullReport {
  skillGaps: SkillGap[] // All gaps
  automationRisk: {
    score: number // 0-100
    explanation: string
    mitigationStrategies: string[]
  }
  marketAnalysis: {
    demandTrend: "growing" | "stable" | "declining"
    averageSalary: string
    topCompanies: string[]
    emergingSkills: string[]
  }
  learningRoadmap: {
    phase: string
    duration: string
    skills: string[]
    resources: any[]
  }[]
  personalizedAdvice: string[]
}