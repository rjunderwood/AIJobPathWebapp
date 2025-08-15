"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lock, Sparkles, Eye, Download, Copy } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface BlurredContentProps {
  content: string
  sections?: any
  sessionId: string
  isAuthenticated?: boolean
}

export function BlurredContent({ 
  content, 
  sections, 
  sessionId, 
  isAuthenticated = false 
}: BlurredContentProps) {
  const [visiblePercentage, setVisiblePercentage] = useState(25) // Show 25%, blur 75%
  
  // Calculate where to apply blur
  const contentLength = content.length
  const visibleLength = Math.floor(contentLength * (visiblePercentage / 100))
  
  // Split content for display
  const visibleContent = content.substring(0, visibleLength)
  const blurredContent = content.substring(visibleLength)
  
  if (isAuthenticated) {
    // Show full content if authenticated
    return (
      <div className="space-y-6">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }} />
        </div>
        
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Get Your Personalized Premium Analysis
              </h3>
              <p className="text-sm text-muted-foreground">
                Unlock AI-powered insights tailored specifically to your background, university, and career goals
              </p>
            </div>
            <Link href={`/checkout?session=${sessionId}`}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                Upgrade to Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="relative">
      {/* Visible content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(visibleContent) }} />
      </div>
      
      {/* Blurred content with overlay */}
      <div className="relative mt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900 z-10" />
        
        <div className="filter blur-sm select-none pointer-events-none opacity-50">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(blurredContent.substring(0, 500)) }} />
          </div>
        </div>
        
        {/* CTA Overlay */}
        <motion.div 
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mx-auto max-w-2xl p-8 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2">
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <Lock className="h-8 w-8 text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold">
                Unlock Your Complete Career Intelligence Report
              </h2>
              
              <p className="text-muted-foreground max-w-md mx-auto">
                Sign up free to reveal your full skill gap analysis and get AI prompts that accelerate your career by 10x
              </p>
              
              <div className="grid gap-3 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span>View complete report instantly</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Copy className="h-4 w-4 text-green-600" />
                  <span>Get 20+ powerful AI prompts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4 text-green-600" />
                  <span>Download PDF version</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href={`/signup?session=${sessionId}&redirect=/report/${sessionId}`}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    Sign Up Free & Reveal Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href={`/login?session=${sessionId}&redirect=/report/${sessionId}`}>
                  <Button size="lg" variant="outline">
                    Already have an account? Log in
                  </Button>
                </Link>
              </div>
              
              <p className="text-xs text-muted-foreground">
                No credit card required • Takes 30 seconds
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Stats to build trust */}
      <motion.div 
        className="mt-16 grid grid-cols-3 gap-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div>
          <div className="text-2xl font-bold">15,000+</div>
          <div className="text-sm text-muted-foreground">Students Helped</div>
        </div>
        <div>
          <div className="text-2xl font-bold">4.9/5</div>
          <div className="text-sm text-muted-foreground">Average Rating</div>
        </div>
        <div>
          <div className="text-2xl font-bold">$12K</div>
          <div className="text-sm text-muted-foreground">Avg Salary Increase</div>
        </div>
      </motion.div>
    </div>
  )
}

function formatMarkdown(text: string): string {
  // Basic markdown to HTML conversion
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}