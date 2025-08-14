"use client"

import { motion } from "framer-motion"
import { AssessmentQuestion } from "@/types/assessment"
import { SingleSelect } from "./QuestionTypes/SingleSelect"
import { MultiSelect } from "./QuestionTypes/MultiSelect"
import { TextInput } from "./QuestionTypes/TextInput"
import { AutocompleteInput } from "./QuestionTypes/AutocompleteInput"
import { RangeSlider } from "./QuestionTypes/RangeSlider"

interface QuestionCardProps {
  question: AssessmentQuestion
  value: any
  onChange: (value: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function QuestionCard({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  isFirst,
  isLast
}: QuestionCardProps) {
  const renderQuestionType = () => {
    switch (question.type) {
      case "single-select":
        return <SingleSelect question={question} value={value} onChange={onChange} />
      case "multi-select":
        return <MultiSelect question={question} value={value} onChange={onChange} />
      case "text-input":
        // Use AutocompleteInput if suggestions are provided
        if (question.suggestions && question.suggestions.length > 0) {
          return <AutocompleteInput 
            question={question} 
            value={value} 
            onChange={onChange}
            suggestions={question.suggestions} 
          />
        }
        return <TextInput question={question} value={value} onChange={onChange} />
      case "range-slider":
        return <RangeSlider question={question} value={value} onChange={onChange} />
      default:
        return null
    }
  }

  const isValid = () => {
    if (!question.required) return true
    if (question.type === "multi-select") {
      return value && value.length > 0
    }
    return !!value
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-gray-600 mb-8">{question.description}</p>
        )}
        
        <div className="mb-8">
          {renderQuestionType()}
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isFirst
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={onNext}
            disabled={question.required && !isValid()}
            className={`px-8 py-3 rounded-lg font-medium transition-all ${
              question.required && !isValid()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105"
            }`}
          >
            {isLast ? "Get Your Results" : "Next"}
          </button>
        </div>
      </div>
    </motion.div>
  )
}