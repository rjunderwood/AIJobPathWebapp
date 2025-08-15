"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PreviewReport } from "@/components/preview/PreviewReport"
import { PreviewData } from "@/types/assessment"

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided")
      setIsLoading(false)
      return
    }

    fetchPreview()
    
  }, [sessionId])

  const fetchPreview = async () => {
    try {
      const response = await fetch("/api/preview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        throw new Error("Failed to generate preview")
      }

      const data = await response.json()
      setPreview(data)
    } catch (err) {
      console.error("Error fetching preview:", err)
      setError("Failed to load your results. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Analyzing your results...</p>
          <p className="text-gray-600 mt-2">This will just take a moment</p>
        </div>
      </div>
    )
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium text-red-600 mb-4">{error}</p>
          <a href="/assessment" className="text-blue-600 hover:underline">
            Start a new assessment
          </a>
        </div>
      </div>
    )
  }

  return <PreviewReport preview={preview} sessionId={sessionId!} />
}