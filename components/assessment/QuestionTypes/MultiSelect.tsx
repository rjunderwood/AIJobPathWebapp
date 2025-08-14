"use client"

import { motion } from "framer-motion"
import { AssessmentQuestion } from "@/types/assessment"
import { Check } from "lucide-react"

interface MultiSelectProps {
  question: AssessmentQuestion
  value: string[] | undefined
  onChange: (value: string[]) => void
}

export function MultiSelect({ question, value = [], onChange }: MultiSelectProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        Select all that apply
      </p>
      {question.options?.map((option, index) => (
        <motion.button
          key={option}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => toggleOption(option)}
          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
            value.includes(option)
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                value.includes(option)
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
              }`}
            >
              {value.includes(option) && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="font-medium">{option}</span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}