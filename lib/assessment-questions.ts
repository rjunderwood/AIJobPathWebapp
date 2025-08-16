import { AssessmentQuestion } from "@/types/assessment"
import { MAJORS, UNIVERSITIES, LEARNING_STYLES, getSkillsForMajor, getRolesForMajor } from "@/lib/constants/assessment-data"

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "major",
    type: "text-input",
    question: "What's your major?",
    description: "Enter your current field of study",
    required: true,
    placeholder: "e.g., Computer Science, Business, Psychology",
    maxLength: 100,
    suggestions: MAJORS
  },
  {
    id: "university",
    type: "text-input",
    question: "Which university/college do you attend?",
    description: "This helps us understand your academic environment",
    required: true,
    placeholder: "e.g., Stanford University, UC Berkeley",
    maxLength: 200,
    suggestions: UNIVERSITIES
  },
  {
    id: "targetRole",
    type: "single-select",
    question: "What's your dream job?",
    description: "Select the role you're aiming for after graduation",
    required: true,
    options: [
      "Business Analyst",
      "Project Manager",
      "Consultant",
      "Marketing Manager",
      "Sales Representative",
      "Other"
    ] // Default general roles, will be dynamically updated based on major
  },
  {
    id: "graduationYear",
    type: "single-select",
    question: "When do you graduate?",
    description: "This helps us timeline your preparation",
    required: true,
    options: [
      "2024",
      "2025",
      "2026",
      "2027",
      "2028",
      "2029",
      "2030"
    ]
  },
  { 
    id: "currentSkills",
    type: "multi-select",
    question: "What skills do you already have?",
    description: "Select all that apply (we'll identify what's missing)",
    required: false,
    options: getSkillsForMajor("Other") // Default options, will be dynamically updated in AssessmentFlow
  },
  {
    id: "learningStyle",
    type: "single-select",
    question: "How do you prefer to learn?",
    description: "This helps us recommend the best learning resources for you",
    required: true,
    options: LEARNING_STYLES.map(style => style.label)
  },
  {
    id: "timeAvailability",
    type: "single-select",
    question: "How much time can you dedicate to learning AI for your career?",
    description: "Be realistic - we'll create a plan that fits your schedule",
    required: true,
    options: [
      "Less than 1 hour/day",
      "1 hour/day",
      "2 hours/day",
      "3 hours/day"
    ]
  },
  {
    id: "careerConcerns",
    type: "text-input",
    question: "What's your biggest career worry?",
    description: "Optional: Share any specific concerns or goals",
    required: false,
    placeholder: "e.g., I'm worried about AI replacing jobs, need to stand out from other graduates",
    maxLength: 500
  }
]