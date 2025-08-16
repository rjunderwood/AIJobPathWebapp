"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Mail, Loader2 } from "lucide-react"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you'd verify the session and get the email
    // For now, we'll just show a success message
    setTimeout(() => {
      setIsLoading(false)
      // Mock email - in production, get this from the Stripe session
      setEmail("user@example.com")
    }, 1000)
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your purchase. Your comprehensive career gap analysis is being generated.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Check your email</p>
          </div>
          <p className="text-gray-700">
            We've sent a magic link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Click the link in your email to access your full report
          </p>
        </div>
        
        <div className="space-y-3 text-left bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-3">What happens next:</h3>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </span>
            <p className="text-gray-700">
              Our AI is analyzing your profile and generating personalized insights
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </span>
            <p className="text-gray-700">
              You'll receive an email with your secure report link (usually within 5 minutes)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              3
            </span>
            <p className="text-gray-700">
              Access your full report anytime with your magic link
            </p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Having issues? Contact support at aijobpath@gmail.com
        </p>
      </motion.div>
    </div>
  )
}