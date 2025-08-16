import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/admin"
import { kv } from "@/lib/cloudflare/kv"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    const supabase = createClient()

    // Get assessment session
    const { data: session, error: sessionError } = await supabase
      .from("assessment_sessions")
      .select("id")
      .eq("session_id", sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Get assessment response
    const { data: assessmentResponse, error: responseError } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("session_id", session?.id || "")
      .single()

    if (responseError || !assessmentResponse) {
      console.error(
        "Assessment response not found for sessionId:",
        sessionId,
        "Error:",
        responseError
      )
      return NextResponse.json(
        { error: "Assessment response not found" },
        { status: 404 }
      )
    }

    // Check if free report exists for this major
    const { data: freeReport } = await supabase
      .from("free_reports")
      .select("*")
      .eq("major", assessmentResponse?.major || "")
      .single()

    if (freeReport) {
      // Parse report data to extract preview info
      const previewData = extractPreviewFromReport(freeReport.report_data as { content?: string; major?: string })
      console.log("Returning cached preview data:", previewData)
      return NextResponse.json(previewData)
    }

    // If no report exists yet, trigger generation
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/report/free/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          major: assessmentResponse.major
        })
      }
    )

    if (!response.ok) {
      throw new Error("Failed to generate report")
    }

    const reportResult = await response.json()

    // Parse newly generated report
    const previewData = extractPreviewFromReport(reportResult.report as { content?: string; major?: string })
    return NextResponse.json(previewData)
  } catch (error) {
    console.error("Preview generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    )
  }
}

function extractPreviewFromReport(reportData: { content?: string; major?: string }): {
  topGaps: any[]
  aiRiskLevel: "Low" | "Medium" | "High"
  aiRiskScore: number
  marketDemand: "Growing" | "Stable" | "Declining"
  topSkillsCount: number
  quickWin: string
  marketInsight: string
  contentPreview: string
  readingTimeMinutes: number
  estimatedPages: number
} {
  try {
    // Handle both old structure (with content) and new structure
    const content = reportData?.content || ""

    console.log("Content for preview extraction:", content)
    
    // Calculate reading time (average reading speed: 200-250 words per minute)
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length
    const readingTimeMinutes = Math.ceil(wordCount / 225) // Using 225 words per minute as average
    
    // Calculate estimated pages (average 250-300 words per page for professional reports)
    // Using 275 words per page as average for well-formatted reports with headers, tables, etc.
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 275))
    
    if (!content) {
      // Return fallback data if no content
      return {
        topGaps: [],
        aiRiskLevel: "Medium" as const,
        aiRiskScore: 5,
        marketDemand: "Stable" as const,
        topSkillsCount: 0,
        quickWin:
          "Complete your assessment to get personalized recommendations",
        marketInsight: "Market analysis is being generated for your major",
        contentPreview: "",
        readingTimeMinutes: 0,
        estimatedPages: 0
      }
    }

    // Extract automation risk score
    const automationRiskMatch = content.match(
      /### Automation Risk Score:\s*(\d+)\/10/i
    )
    const automationRisk = automationRiskMatch
      ? parseInt(automationRiskMatch[1])
      : 5

    // Convert automation risk to clear AI risk level
    let aiRiskLevel: "Low" | "Medium" | "High"
    if (automationRisk <= 3) {
      aiRiskLevel = "Low"
    } else if (automationRisk <= 6) {
      aiRiskLevel = "Medium"
    } else {
      aiRiskLevel = "High"
    }

    // Extract market demand from market analysis sections
    const marketDemandKeywords = {
      growing: /growing|increasing|rising|expanding|strong.*demand|high.*demand|boom/i,
      declining: /declining|decreasing|falling|shrinking|weak.*demand|low.*demand|recession/i
    }
    
    let marketDemand: "Growing" | "Stable" | "Declining" = "Stable"
    if (marketDemandKeywords.growing.test(content)) {
      marketDemand = "Growing"
    } else if (marketDemandKeywords.declining.test(content)) {
      marketDemand = "Declining"
    }

    // Extract skills from Technical Skills Gap table or similar sections
    const topGaps = []
    
    // Look for skill lines in various formats
    const skillLines = content.match(/\| \[([^\]]+)\] \|/g) || 
                      content.match(/\*\*\[([^\]]+)\]\*\*/g) ||
                      content.match(/- \*\*([^*]+)\*\*/g) ||
                      content.match(/\d+\.\s*\*\*([^*]+)\*\*/g) || []

    for (let i = 0; i < Math.min(3, skillLines.length); i++) {
      const skillMatch = skillLines[i].match(/\[([^\]]+)\]/) || 
                        skillLines[i].match(/\*\*([^*]+)\*\*/)
      if (skillMatch) {
        topGaps.push({
          skill: skillMatch[1].trim(),
          importance: i === 0 ? "critical" : i === 1 ? "high" : "medium",
          currentLevel: 2 + i,
          requiredLevel: 8 - i,
          timeToLearn: `${2 + i}-${3 + i} months`,
          description: `Essential skill for ${reportData.major || "your field"}`,
          resources: []
        })
      }
    }

    // Count total skills mentioned in technical skills section
    const technicalSkillsSection = content.match(/## 🎯 Critical Skills[\s\S]*?(?=##|$)/i)?.[0] || ""
    const allSkillMatches = technicalSkillsSection.match(/\| [^|]+ \|/g) || []
    const topSkillsCount = Math.max(allSkillMatches.length - 1, topGaps.length) // -1 to exclude header row

    // Extract market insight from salary table or market sections
    const salaryTableMatch = content.match(
      /\| 50th \| \$([0-9,]+) \|/i
    ) || content.match(
      /50th.*?\$([0-9,]+)/i
    )
    const salary = salaryTableMatch ? salaryTableMatch[1] : "55,000"

    const marketInsight = `Market analysis for ${reportData.major || "this major"} shows $${salary} median entry-level salary with ${marketDemand.toLowerCase()} demand trends.`

    // Extract quick win from Next 48 Hours section
    const quickWinMatch = content.match(
      /## 🎯 Next 48 Hours[\s\S]*?1\.\s*\*\*([^*]+)\*\*/i
    ) || content.match(
      /### Next 48 Hours[\s\S]*?1\.\s*([^\n]*)/i
    ) || content.match(
      /1\.\s*\*\*([^*]+)\*\*/i
    )
    const quickWin = quickWinMatch
      ? quickWinMatch[1].replace(/\[|\]/g, "").trim()
      : "Start building your first portfolio project today"

    return {
      topGaps,
      aiRiskLevel,
      aiRiskScore: automationRisk,
      marketDemand,
      topSkillsCount,
      quickWin,
      marketInsight,
      contentPreview: content.slice(0, Math.floor(content.length * 0.10)),
      readingTimeMinutes,
      estimatedPages
    }
  } catch (error) {
    console.error("Error extracting preview data:", error)
    // Return safe fallback
    return {
      topGaps: [],
      aiRiskLevel: "Medium" as const,
      aiRiskScore: 5,
      marketDemand: "Stable" as const,
      topSkillsCount: 3,
      quickWin: "Complete your assessment to get personalized recommendations",
      marketInsight: "Market analysis is being generated for your major",
      contentPreview: "",
      readingTimeMinutes: 0,
      estimatedPages: 0
    }
  }
}
