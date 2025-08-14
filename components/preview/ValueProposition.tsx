"use client"

import { motion } from "framer-motion"
import { Check, Lock, Sparkles } from "lucide-react"

export function ValueProposition() {
  const features = [
    "Complete skill gap analysis (not just top 3)",
    "AI automation risk assessment",
    "Personalized learning roadmap",
    "Market salary insights",
    "Top hiring companies list",
    "Month-by-month action plan",
    "Resource recommendations",
    "PDF report download"
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white rounded-full shadow-md">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Unlock Your Full Career Report
        </h2>
      </div>
      
      <p className="text-gray-700 mb-6">
        This preview shows only your top 3 skill gaps. Get the complete analysis to accelerate your career:
      </p>
      
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">One-time investment</p>
            <p className="text-3xl font-bold text-gray-900">$19</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 line-through">Regular $49</p>
            <p className="text-sm font-medium text-green-600">Save 60%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Lock className="w-4 h-4" />
          <span>Secure payment via Stripe</span>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          30-day money-back guarantee if you're not satisfied
        </p>
      </div>
    </motion.div>
  )
}