"use client"

import { AssessmentQuestion } from "@/types/assessment"

interface RangeSliderProps {
  question: AssessmentQuestion
  value: number | undefined
  onChange: (value: number) => void
}

export function RangeSlider({ question, value = question.min || 0, onChange }: RangeSliderProps) {
  const min = question.min || 0
  const max = question.max || 100
  const step = question.step || 1

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{min}</span>
        <span className="text-2xl font-bold text-blue-600">{value}</span>
        <span className="text-sm text-gray-600">{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
            ((value - min) / (max - min)) * 100
          }%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)`
        }}
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: none;
        }
      `}</style>
    </div>
  )
}