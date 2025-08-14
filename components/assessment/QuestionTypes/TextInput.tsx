"use client"

import { AssessmentQuestion } from "@/types/assessment"

interface TextInputProps {
  question: AssessmentQuestion
  value: string | undefined
  onChange: (value: string) => void
}

export function TextInput({ question, value = "", onChange }: TextInputProps) {
  return (
    <div className="space-y-2">
      {question.maxLength && question.maxLength > 100 ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none transition-colors"
          rows={4}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
        />
      )}
      {question.maxLength && (
        <p className="text-sm text-gray-500 text-right">
          {value.length}/{question.maxLength}
        </p>
      )}
    </div>
  )
}