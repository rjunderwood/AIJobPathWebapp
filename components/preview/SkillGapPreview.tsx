"use client"

import { motion } from "framer-motion"
import { SkillGap } from "@/types/assessment"
import { TrendingUp, Clock, AlertCircle } from "lucide-react"

interface SkillGapPreviewProps {
  gap: SkillGap
  index: number
}

export function SkillGapPreview({ gap, index }: SkillGapPreviewProps) {
  const gapPercentage = ((gap.requiredLevel - gap.currentLevel) / gap.requiredLevel) * 100
  
  const importanceColor = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200"
  }[gap.importance]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{gap.skill}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${importanceColor}`}>
          {gap.importance}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{gap.description}</p>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Your level</span>
            <span className="font-medium">{gap.currentLevel}/10</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              style={{ width: `${gap.currentLevel * 10}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Required level</span>
            <span className="font-medium">{gap.requiredLevel}/10</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              style={{ width: `${gap.requiredLevel * 10}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{gap.timeToLearn}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-medium">
            {Math.round(gapPercentage)}% improvement needed
          </span>
        </div>
      </div>
      
      {gap.resources.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Top resource to start:
          </p>
          <div className="text-sm text-blue-600 hover:text-blue-700">
            {gap.resources[0].title}
          </div>
        </div>
      )}
    </motion.div>
  )
}