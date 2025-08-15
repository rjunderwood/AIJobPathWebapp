"use client"

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownReportDisplayProps {
  content: string
}

export function MarkdownReportDisplay({ content }: MarkdownReportDisplayProps) {
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
      className="bg-white rounded-xl p-8 mb-12 border border-gray-200 shadow-sm"
    >
      <div className="prose prose-gray max-w-none">
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