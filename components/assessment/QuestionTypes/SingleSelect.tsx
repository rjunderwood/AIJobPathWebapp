"use client"

import { motion } from "framer-motion"
import { AssessmentQuestion } from "@/types/assessment"

interface SingleSelectProps {
  question: AssessmentQuestion
  value: string | undefined
  onChange: (value: string) => void
}

export function SingleSelect({ question, value, onChange }: SingleSelectProps) {
  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <motion.button
          key={option}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onChange(option)}
          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
            value === option
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                value === option
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
              }`}
            >
              {value === option && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="font-medium">{option}</span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}