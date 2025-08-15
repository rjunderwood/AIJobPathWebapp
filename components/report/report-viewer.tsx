"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Brain, 
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Calendar,
  DollarSign,
  Users,
  BookOpen
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface ReportViewerProps {
  reportData: any
  reportType: 'free' | 'premium'
  showPrompts?: boolean
  promptsData?: any
}

export function ReportViewer({ 
  reportData, 
  reportType, 
  showPrompts = false,
  promptsData 
}: ReportViewerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedId(null), 2000)
  }
  
  const handleDownloadPDF = () => {
    // In production, this would generate and download a PDF
    toast.info("PDF download coming soon!")
  }
  
  // Parse sections from report content
  const sections = reportData.sections || parseReportSections(reportData.content)
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {reportType === 'premium' ? 'Your Personalized Career Intelligence Report' : 'Career Intelligence Report'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {reportType === 'premium' 
              ? `Tailored specifically for ${reportData.university} ${reportData.major} → ${reportData.targetRole}`
              : `Comprehensive analysis for ${reportData.major} students`
            }
          </p>
        </div>
        <Button onClick={handleDownloadPDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      
      {/* Quick Stats */}
      {reportType === 'premium' && reportData.personalizedInsights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Time to Graduate</p>
                <p className="text-xl font-bold">{reportData.personalizedInsights.monthsToGraduation} months</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Skills to Master</p>
                <p className="text-xl font-bold">{reportData.personalizedInsights.currentSkills?.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Learning Style</p>
                <p className="text-xl font-bold capitalize">{reportData.personalizedInsights.learningStyle || 'Visual'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Weekly Hours</p>
                <p className="text-xl font-bold">{reportData.personalizedInsights.timeAvailability || '10-15'}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="report" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="report">
            <FileText className="mr-2 h-4 w-4" />
            Full Report
          </TabsTrigger>
          {showPrompts && (
            <TabsTrigger value="prompts">
              <Brain className="mr-2 h-4 w-4" />
              AI Prompts
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="report" className="space-y-6">
          {/* Render each section */}
          {Object.entries(sections).map(([key, section]: [string, any], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  {getSectionIcon(key)}
                  {section.title}
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formatContent(section.content) }} />
                </div>
                {section.subsections && (
                  <div className="mt-4 space-y-3">
                    {section.subsections.map((sub: any, subIndex: number) => (
                      <div key={subIndex} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium mb-2">{sub.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          <div dangerouslySetInnerHTML={{ __html: formatContent(sub.content) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </TabsContent>
        
        {showPrompts && promptsData && (
          <TabsContent value="prompts" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Your AI Power Prompts</h2>
              <p className="text-muted-foreground mt-2">
                {reportType === 'premium' 
                  ? 'Personalized prompts designed specifically for your career transition'
                  : `Powerful prompts optimized for ${reportData.major} students`
                }
              </p>
            </div>
            
            {/* Prompts by category */}
            {promptsData.prompts && (
              <div className="grid gap-4">
                {promptsData.prompts.map((prompt: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{prompt.title}</h3>
                          <p className="text-sm text-muted-foreground">{prompt.useCase}</p>
                          {prompt.expectedOutcome && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Expected: {prompt.expectedOutcome}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {prompt.difficulty && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              prompt.difficulty === 'advanced' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : prompt.difficulty === 'intermediate'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {prompt.difficulty}
                            </span>
                          )}
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {prompt.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{prompt.content}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(prompt.content, `prompt-${index}`)}
                        >
                          {copiedId === `prompt-${index}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function parseReportSections(content: string): any {
  const sections: any = {}
  const sectionPattern = /##\s*([^#\n]+)\n([\s\S]*?)(?=##\s*[^#\n]+\n|$)/g
  let match
  
  while ((match = sectionPattern.exec(content)) !== null) {
    const sectionTitle = match[1].trim()
    const sectionContent = match[2].trim()
    const sectionKey = sectionTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
    
    sections[sectionKey] = {
      title: sectionTitle,
      content: sectionContent
    }
  }
  
  return sections
}

function getSectionIcon(key: string) {
  const iconMap: { [key: string]: any } = {
    ai_disruption: <Brain className="h-5 w-5 text-purple-600" />,
    salary: <DollarSign className="h-5 w-5 text-green-600" />,
    skills: <CheckSquare className="h-5 w-5 text-blue-600" />,
    market: <TrendingUp className="h-5 w-5 text-orange-600" />,
    warnings: <AlertTriangle className="h-5 w-5 text-red-600" />,
    insider: <Lightbulb className="h-5 w-5 text-yellow-600" />,
    network: <Users className="h-5 w-5 text-indigo-600" />,
    learning: <BookOpen className="h-5 w-5 text-pink-600" />,
  }
  
  for (const [mapKey, icon] of Object.entries(iconMap)) {
    if (key.includes(mapKey)) return icon
  }
  
  return <FileText className="h-5 w-5 text-gray-600" />
}

function formatContent(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gim, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p class="mb-4">')
    .replace(/$/, '</p>')
}