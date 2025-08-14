"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AssessmentQuestion } from "@/types/assessment"
import { Check, ChevronDown } from "lucide-react"

interface AutocompleteInputProps {
  question: AssessmentQuestion
  value: string | undefined
  onChange: (value: string) => void
  suggestions: string[]
}

export function AutocompleteInput({ 
  question, 
  value = "", 
  onChange,
  suggestions 
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setFilteredSuggestions(suggestions) // Show all suggestions when empty
      setIsOpen(false)
    }
  }, [inputValue, suggestions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setHighlightedIndex(-1)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    onChange(suggestion)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && filteredSuggestions.length > 0) {
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex])
        } else {
          setIsOpen(false)
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleFocus = () => {
    if (inputValue.length === 0) {
      setFilteredSuggestions(suggestions)
      setIsOpen(true)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          className="w-full p-4 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-base"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          // Prevent mobile zoom on focus
          style={{ fontSize: '16px' }}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown 
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} 
          />
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && filteredSuggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overscroll-contain"
            style={{
              // Better mobile scrolling
              WebkitOverflowScrolling: 'touch',
              // Ensure dropdown doesn't go off-screen on mobile
              maxHeight: 'min(240px, 40vh)'
            }}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  highlightedIndex === index ? "bg-gray-50" : ""
                } ${index !== filteredSuggestions.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span className="text-gray-900">{suggestion}</span>
                {inputValue === suggestion && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {question.maxLength && (
        <p className="text-sm text-gray-500 text-right mt-1">
          {inputValue.length}/{question.maxLength}
        </p>
      )}
    </div>
  )
}