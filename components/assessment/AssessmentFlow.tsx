"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { ProgressIndicator } from "./ProgressIndicator"
import { QuestionCard } from "./QuestionCard"
import { assessmentQuestions } from "@/lib/assessment-questions"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { toast } from "sonner"

interface AssessmentResponses {
  major?: string
  university?: string
  targetRole?: string
  graduationYear?: string
  currentSkills?: string[]
  learningStyle?: string
  timeAvailability?: string
  careerConcerns?: string
  [key: string]: any
}

export function AssessmentFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useLocalStorage<AssessmentResponses>("assessment-responses", {})
  const [sessionId, setSessionId] = useLocalStorage("assessment-session-id", "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Generate session ID if not exists
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
      
      // Create session in database
      fetch("/api/assessment/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: newSessionId })
      })
    }
  }, [sessionId, setSessionId])

  const currentQuestion = assessmentQuestions[currentStep]
  const totalSteps = assessmentQuestions.length

  const handleResponseChange = (value: any) => {
    setResponses({ ...responses, [currentQuestion.id]: value })
  }

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit assessment
      await submitAssessment()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitAssessment = async () => {
    setIsSubmitting(true)
    
    try {
      // Format responses for submission
      const formattedResponses = {
        major: responses.major || "",
        university: responses.university || "",
        targetRole: responses.targetRole || "",
        graduationYear: parseInt(responses.graduationYear || "2025"),
        currentSkills: responses.currentSkills || [],
        learningStyle: responses.learningStyle,
        timeAvailability: responses.timeAvailability || "",
        careerConcerns: responses.careerConcerns
      }

      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          responses: formattedResponses
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit assessment")
      }

      const data = await response.json()
      
      // Clear local storage
      localStorage.removeItem("assessment-responses")
      
      // Redirect to preview page
      router.push(`/assessment/preview?session=${sessionId}`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
      toast.error("Failed to submit assessment. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        <ProgressIndicator
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
        />
        
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentStep}
            question={currentQuestion}
            value={responses[currentQuestion.id]}
            onChange={handleResponseChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentStep === 0}
            isLast={currentStep === totalSteps - 1}
          />
        </AnimatePresence>
        
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Analyzing your profile...</p>
              <p className="text-gray-600 mt-2">This will just take a moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}