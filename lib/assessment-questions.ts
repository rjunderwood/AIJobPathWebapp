import { AssessmentQuestion } from "@/types/assessment"

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "major",
    type: "text-input",
    question: "What's your major?",
    description: "Enter your current field of study",
    required: true,
    placeholder: "e.g., Computer Science, Business, Psychology",
    maxLength: 100
  },
  {
    id: "university",
    type: "text-input",
    question: "Which university do you attend?",
    description: "This helps us understand your academic environment",
    required: true,
    placeholder: "e.g., Stanford University, UC Berkeley",
    maxLength: 200
  },
  {
    id: "targetRole",
    type: "single-select",
    question: "What's your dream job?",
    description: "Select the role you're aiming for after graduation",
    required: true,
    options: [
      "Software Engineer",
      "Data Scientist",
      "Product Manager",
      "UX/UI Designer",
      "Marketing Manager",
      "Financial Analyst",
      "Consultant",
      "Business Analyst",
      "Machine Learning Engineer",
      "DevOps Engineer",
      "Other"
    ]
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
    options: [
      "Programming (Python, Java, etc.)",
      "Data Analysis",
      "Machine Learning",
      "Web Development",
      "Mobile Development",
      "Cloud Computing (AWS, Azure, etc.)",
      "Database Management",
      "Project Management",
      "Communication & Presentation",
      "Leadership",
      "Design Tools (Figma, Adobe, etc.)",
      "Statistical Analysis",
      "Business Strategy",
      "Financial Modeling"
    ]
  },
  {
    id: "timeAvailability",
    type: "single-select",
    question: "How much time can you dedicate to learning?",
    description: "Be realistic - we'll create a plan that fits your schedule",
    required: true,
    options: [
      "Less than 5 hours/week",
      "5-10 hours/week",
      "10-20 hours/week",
      "20-30 hours/week",
      "30+ hours/week"
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