"use client"

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownReportDisplayProps {
  content: string
  readingTimeMinutes?: number
  estimatedPages?: number
}

export function MarkdownReportDisplay({ content, readingTimeMinutes, estimatedPages }: MarkdownReportDisplayProps) {
  if (!content) {
    return (
      <div className="bg-white rounded-xl p-8 mb-12 border border-gray-200 shadow-sm">
        <div className="text-center text-gray-600 py-8">
          Your personalized report is being generated...
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-8 mb-12 border border-gray-200 shadow-sm relative overflow-hidden"
    >

      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-200 pb-3">
        Your Report
        <span className="ml-3 text-lg font-normal text-gray-500">
          {readingTimeMinutes && readingTimeMinutes > 0 && estimatedPages && estimatedPages > 0 && (
            <>({estimatedPages} pages • {readingTimeMinutes} min read)</>
          )}
          {readingTimeMinutes && readingTimeMinutes > 0 && (!estimatedPages || estimatedPages === 0) && (
            <>({readingTimeMinutes} min read)</>
          )}
          {estimatedPages && estimatedPages > 0 && (!readingTimeMinutes || readingTimeMinutes === 0) && (
            <>({estimatedPages} pages)</>
          )}
        </span>
      </h1>
      <div className="prose prose-gray max-w-none relative">
        {/* Fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-[48rem] bg-gradient-to-t from-white via-white/95 via-white/70 to-transparent pointer-events-none z-10" />
        
        {/* Floating CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/95 to-indigo-50/95 backdrop-blur-sm p-8 shadow-2xl z-20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
            {/* Left side - Text content */}
            <div className="flex-1 text-left">
              <h3 className="mb-3 text-xl md:text-2xl font-bold text-gray-900">
                Continue with an account to:
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-base md:text-lg mt-0.5">✅</span>
                  <p className="text-base md:text-lg text-gray-700">
                    View And Download Your <strong>Full {estimatedPages} Page Report</strong> + Your Free <strong>AI Tooling Prompts</strong> for Your Career
                  </p>
                </div>
                <div className="text-lg md:text-xl font-bold text-purple-600 ml-6 md:ml-7">+</div>
                <div className="flex items-start gap-2">
                  <span className="text-base md:text-lg mt-0.5">🚀</span>
                  <p className="text-base md:text-lg text-gray-700">
                    Unlock Your Highly <strong>Personalised Analysis Report</strong> + <strong>Advanced AI Tooling Prompts</strong>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Divider - only visible on medium screens and up */}
            <div className="hidden md:block w-px h-28 bg-purple-300 mx-2" />
            
            {/* Right side - Sign in elements */}
            <div className="flex flex-col items-center gap-3 md:w-64 lg:w-80">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 md:px-6 rounded-lg transition-colors">
                Sign In / Sign Up
              </button>
              <p className="text-xs md:text-sm text-gray-600 text-center">
                Create a free account to access your personalized career analysis
              </p>
            </div>
          </div>
        </motion.div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
          // Custom styling for headings
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-200 pb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-900 mb-4 mt-8 border-b border-gray-200 pb-2"
            >
              {children}
            </motion.h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium text-gray-700 mb-2 mt-4">
              {children}
            </h4>
          ),
          
          // Custom styling for paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4">
              {children}
            </p>
          ),
          
          // Custom styling for lists
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-medium mt-1">•</span>
              <span className="text-gray-700">{children}</span>
            </li>
          ),
          
          // Custom styling for blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 my-6 rounded-r-lg">
              <div className="text-gray-800 font-medium">
                {children}
              </div>
            </blockquote>
          ),
          
          // Custom styling for tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
              {children}
            </td>
          ),
          
          // Custom styling for code
          code: ({ children, ...props }) => {
            const isInline = !props.className?.includes('language-')
            return isInline ? (
              <code className="bg-gray-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">
                {children}
              </code>
            ) : (
              <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {children}
              </code>
            )
          },
          
          // Custom styling for strong/bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          
          // Custom styling for emphasis/italic
          em: ({ children }) => (
            <em className="italic text-gray-600">
              {children}
            </em>
          ),
          
          // Custom styling for horizontal rules
          hr: () => (
            <hr className="my-8 border-t-2 border-gray-200" />
          ),
          
          // Custom styling for links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  )
}