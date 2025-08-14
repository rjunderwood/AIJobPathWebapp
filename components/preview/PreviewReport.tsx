"use client"

import { motion } from "framer-motion"
import { PreviewData } from "@/types/assessment"
import { SkillGapPreview } from "./SkillGapPreview"
import { ValueProposition } from "./ValueProposition"
import { PurchaseCTA } from "./PurchaseCTA"
import { Target, TrendingUp, Zap } from "lucide-react"

interface PreviewReportProps {
  preview: PreviewData
  sessionId: string
}

export function PreviewReport({ preview, sessionId }: PreviewReportProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Career Gap Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Here's what you need to focus on to land your dream job
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
            <div className="inline-flex p-3 bg-blue-100 rounded-full mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {preview.overallReadiness}%
            </div>
            <p className="text-gray-600">Career Readiness</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
            <div className="inline-flex p-3 bg-purple-100 rounded-full mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {preview.estimatedTimeToReady}
            </div>
            <p className="text-gray-600">Time to Job-Ready</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
            <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {preview.topGaps.length}
            </div>
            <p className="text-gray-600">Critical Gaps Found</p>
          </div>
        </motion.div>

        {/* Market Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-xl p-6 mb-12 border-2 border-blue-200"
        >
          <h3 className="font-bold text-gray-900 mb-2">Market Insight</h3>
          <p className="text-gray-700">{preview.marketInsight}</p>
        </motion.div>

        {/* Quick Win */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-50 rounded-xl p-6 mb-12 border-2 border-green-200"
        >
          <h3 className="font-bold text-gray-900 mb-2">Quick Win - Start Today!</h3>
          <p className="text-gray-700">{preview.quickWin}</p>
        </motion.div>

        {/* Top 3 Skill Gaps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Top 3 Skill Gaps
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {preview.topGaps.map((gap, index) => (
              <SkillGapPreview key={gap.skill} gap={gap} index={index} />
            ))}
          </div>
        </div>

        {/* Value Proposition and CTA */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ValueProposition />
          <PurchaseCTA sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
}