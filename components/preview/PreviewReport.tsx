"use client"

import { motion } from "framer-motion"
import { PreviewData } from "@/types/assessment"
import { SkillGapPreview } from "./SkillGapPreview"
import { ValueProposition } from "./ValueProposition"
import { PurchaseCTA } from "./PurchaseCTA"
import { MarkdownReportDisplay } from "./MarkdownReportDisplay"
import { Target, TrendingUp, Zap } from "lucide-react"

interface PreviewReportProps {
  preview: PreviewData
  sessionId: string
}

export function PreviewReport({ preview, sessionId }: PreviewReportProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Your Career With AI Gap Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Here's what you need to focus on to land your dream job in the AI
            workforce
          </p>
        </motion.div>

        {preview.contentPreview && (
          <MarkdownReportDisplay content={preview.contentPreview} />
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 grid gap-6 md:grid-cols-3"
        >
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 text-center">
            <div className="mb-3 inline-flex rounded-full bg-blue-100 p-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {preview.overallReadiness || 0}%
            </div>
            <p className="text-gray-600">Career Readiness</p>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 text-center">
            <div className="mb-3 inline-flex rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {preview.estimatedTimeToReady || "N/A"}
            </div>
            <p className="text-gray-600">Time to Job-Ready</p>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 text-center">
            <div className="mb-3 inline-flex rounded-full bg-green-100 p-3">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {preview.topGaps?.length || 0}
            </div>
            <p className="text-gray-600">Critical Gaps Found</p>
          </div>
        </motion.div>

        {/* Market Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 rounded-xl border-2 border-blue-200 bg-blue-50 p-6"
        >
          <h3 className="mb-2 font-bold text-gray-900">Market Insight</h3>
          <p className="text-gray-700">
            {preview.marketInsight || "Market analysis is being generated..."}
          </p>
        </motion.div>

        {/* Quick Win */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 rounded-xl border-2 border-green-200 bg-green-50 p-6"
        >
          <h3 className="mb-2 font-bold text-gray-900">
            Quick Win - Start Today!
          </h3>
          <p className="text-gray-700">
            {preview.quickWin ||
              "Your personalized quick win is being generated..."}
          </p>
        </motion.div>

        {/* Top 3 Skill Gaps */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Your Top 3 Skill Gaps
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {preview.topGaps?.map((gap, index) => (
              <SkillGapPreview key={gap.skill} gap={gap} index={index} />
            )) || (
              <div className="col-span-3 py-8 text-center text-gray-600">
                Your skill gap analysis is being generated...
              </div>
            )}
          </div>
        </div>

        {/* Value Proposition and CTA */}
        <div className="grid gap-8 lg:grid-cols-2">
          <ValueProposition />
          <PurchaseCTA sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
}
