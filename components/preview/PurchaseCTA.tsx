"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Shield, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

interface PurchaseCTAProps {
  sessionId: string
  email?: string
}

export function PurchaseCTA({ sessionId, email }: PurchaseCTAProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState(email || "")

  const handleCheckout = async () => {
    if (!userEmail) {
      alert("Please enter your email address")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          email: userEmail
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { checkoutUrl } = await response.json()
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to start checkout. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
    >
      <h2 className="text-3xl font-bold mb-4">
        Ready to Close Your Skill Gaps?
      </h2>
      <p className="text-blue-100 mb-6">
        Join thousands of students who've accelerated their careers with our AI-powered analysis.
      </p>
      
      {!email && (
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Enter your email to continue:
          </label>
          <input
            type="email"
            id="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={isLoading || !userEmail}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
          isLoading || !userEmail
            ? "bg-white/20 cursor-not-allowed"
            : "bg-white text-blue-600 hover:shadow-lg transform hover:scale-105"
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Get My Full Report - $19
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
      
      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-blue-100">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Secure checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <span>30-day guarantee</span>
        </div>
      </div>
    </motion.div>
  )
}