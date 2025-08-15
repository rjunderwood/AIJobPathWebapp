"use client"

import { motion } from "framer-motion"
import { PreviewData } from "@/types/assessment"
import { SkillGapPreview } from "./SkillGapPreview"
import { ValueProposition } from "./ValueProposition"
import { PurchaseCTA } from "./PurchaseCTA"
import { MarkdownReportDisplay } from "./MarkdownReportDisplay"
// import { Shield, TrendingUp, CheckSquare } from "lucide-react"

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



        {/* Market Analysis Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 grid gap-6 md:grid-cols-3"
        >
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 text-center">
            <div className={`mb-3 inline-flex rounded-full p-3 ${
              preview.aiRiskLevel === "Low" ? "bg-green-100" :
              preview.aiRiskLevel === "Medium" ? "bg-yellow-100" : "bg-red-100"
            }`}>
              {/* <Shield className={`h-6 w-6 ${
                preview.aiRiskLevel === "Low" ? "text-green-600" :
                preview.aiRiskLevel === "Medium" ? "text-yellow-600" : "text-red-600"
              }`} /> */}
              <div className={`h-6 w-6 rounded border-2 flex items-center justify-center text-xs font-bold ${
                preview.aiRiskLevel === "Low" ? "text-green-600 border-green-600" :
                preview.aiRiskLevel === "Medium" ? "text-yellow-600 border-yellow-600" : "text-red-600 border-red-600"
              }`}>
                🛡️
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {preview.aiRiskLevel}
            </div>
            <p className="text-gray-600">AI Risk Level</p>
            <p className="text-xs text-gray-500 mt-1">
              How likely AI will disrupt this major
            </p>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 text-center">
            <div className={`mb-3 inline-flex rounded-full p-3 ${
              preview.marketDemand === "Growing" ? "bg-green-100" :
              preview.marketDemand === "Stable" ? "bg-blue-100" : "bg-red-100"
            }`}>
              {/* <TrendingUp className={`h-6 w-6 ${
                preview.marketDemand === "Growing" ? "text-green-600" :
                preview.marketDemand === "Stable" ? "text-blue-600" : "text-red-600"
              }`} /> */}
              <div className={`h-6 w-6 flex items-center justify-center text-lg ${
                preview.marketDemand === "Growing" ? "text-green-600" :
                preview.marketDemand === "Stable" ? "text-blue-600" : "text-red-600"
              }`}>
                📈
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {preview.marketDemand}
            </div>
            <p className="text-gray-600">Market Demand</p>
            <p className="text-xs text-gray-500 mt-1">
              Job market trend for this major
            </p>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 text-center">
            <div className="mb-3 inline-flex rounded-full bg-purple-100 p-3">
              {/* <CheckSquare className="h-6 w-6 text-purple-600" /> */}
              <div className="h-6 w-6 flex items-center justify-center text-lg text-purple-600">
                ✅
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {preview.topSkillsCount || preview.topGaps?.length || 0}
            </div>
            <p className="text-gray-600">Critical Skills</p>
            <p className="text-xs text-gray-500 mt-1">
              Most important skills for this major
            </p>
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


        {preview.contentPreview && (
          <MarkdownReportDisplay content={preview.contentPreview} />
        )}

        {/* Quick Win */}
        {/* <motion.div
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
        </motion.div> */}

        {/* Top 3 Skill Gaps */}
        {/* <div className="mb-12">
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
        </div> */}

        {/* Value Proposition and CTA */}
        <div className="grid gap-8 lg:grid-cols-2">
          <ValueProposition />
          <PurchaseCTA sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
}
