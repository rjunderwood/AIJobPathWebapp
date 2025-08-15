"use client"

import { motion } from "framer-motion"

interface ReportContentDisplayProps {
  content: string
}

export function ReportContentDisplay({ content }: ReportContentDisplayProps) {
  if (!content) {
    return null
  }

  // Split content into paragraphs and format them
  const formatContent = (text: string) => {
    // Split by double newlines to get paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim()
      
      // Skip empty paragraphs
      if (!trimmed) return null
      
      // Handle numbered sections with emojis (e.g., "1) 🤖 AI Disruption Reality Check")
      if (/^\d+\)\s*[🤖💰🎯📈🚀💡⚠️🛠️📊🎯]/.test(trimmed)) {
        const parts = trimmed.match(/^(\d+\)\s*[🤖💰🎯📈🚀💡⚠️🛠️📊🎯]\s*)(.*)/)
        if (parts) {
          const [, prefix, title] = parts
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">
                <span className="text-blue-600">{prefix}</span>
                {title}
              </h2>
            </motion.div>
          )
        }
      }
      
      // Handle bullet points starting with "-"
      if (trimmed.startsWith('- ')) {
        const bulletContent = trimmed.substring(2)
        
        // Handle special bullet formatting like "- [Skill Name]: Description"
        if (bulletContent.includes(':')) {
          const [skillName, ...descParts] = bulletContent.split(':')
          const description = descParts.join(':').trim()
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="mb-3 ml-4"
            >
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-medium mt-1">•</span>
                <div>
                  <span className="font-semibold text-gray-900">{skillName.replace(/\[|\]/g, '')}</span>
                  {description && <span className="text-gray-700">: {description}</span>}
                </div>
              </div>
            </motion.div>
          )
        }
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-3 ml-4"
          >
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-medium mt-1">•</span>
              <span className="text-gray-700">{bulletContent}</span>
            </div>
          </motion.div>
        )
      }
      
      // Handle subsection headers (text ending with colon)
      if (trimmed.endsWith(':') && trimmed.length < 100) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-4 mt-6"
          >
            <h3 className="text-lg font-semibold text-gray-800">{trimmed}</h3>
          </motion.div>
        )
      }
      
      // Format bold text **text** 
      const formatBoldText = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      }
      
      // Regular paragraph
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="mb-4"
        >
          <p 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: formatBoldText(trimmed)
            }}
          />
        </motion.div>
      )
    }).filter(Boolean)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl p-8 mb-12 border border-gray-200 shadow-sm"
    >
      <div className="prose prose-gray max-w-none">
        {formatContent(content)}
      </div>
    </motion.div>
  )
}