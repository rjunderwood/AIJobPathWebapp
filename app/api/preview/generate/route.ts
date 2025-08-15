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
      const previewData = extractPreviewFromReport(freeReport.report_data)
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
    const previewData = extractPreviewFromReport(reportResult.report)
    return NextResponse.json(previewData)
  } catch (error) {
    console.error("Preview generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    )
  }
}

function extractPreviewFromReport(reportData: any): any {
  try {
    // Handle both old structure (with content) and new structure
    const content = reportData?.content || ""

    console.log("Content for preview extraction:", content)
    if (!content) {
      // Return fallback data if no content
      return {
        topGaps: [],
        overallReadiness: 0,
        estimatedTimeToReady: "Analysis pending",
        quickWin:
          "Complete your assessment to get personalized recommendations",
        marketInsight: "Market analysis is being generated for your major"
      }
    }

    // Parse markdown content to extract key metrics
    const automationRiskMatch = content.match(
      /### Automation Risk Score:\s*(\d+)\/10/i
    )
    const automationRisk = automationRiskMatch
      ? parseInt(automationRiskMatch[1])
      : 5

    // Calculate overall readiness (inverse of automation risk + adjustments)
    const overallReadiness = Math.min(
      100,
      Math.max(0, (10 - automationRisk) * 10 + 20)
    )

    // Extract time estimates from timeline section
    const timelineMatch = content.match(
      /### Timeline to Major Disruption[\s\S]*?- \*\*(\d+)-(\d+) months/i
    )
    const timeToReady = timelineMatch
      ? `${Math.ceil(12 - automationRisk)} months`
      : "6-12 months"

    // Extract skills from Technical Skills Gap table
    const skillsTableMatch = content.match(
      /### Technical Skills Gap[\s\S]*?\| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/i
    )
    const topGaps = []

    // Look for skill lines in the table or list format
    const skillLines = content.match(/\| \[([^\]]+)\] \|/g) || 
                      content.match(/\*\*\[([^\]]+)\]\*\*/g) ||
                      content.match(/- \*\*([^*]+)\*\*/g) || []

    for (let i = 0; i < Math.min(3, skillLines.length); i++) {
      const skillMatch = skillLines[i].match(/\[([^\]]+)\]/) || 
                        skillLines[i].match(/\*\*([^*]+)\*\*/)
      if (skillMatch) {
        topGaps.push({
          skill: skillMatch[1],
          importance: i === 0 ? "critical" : i === 1 ? "high" : "medium",
          currentLevel: 2 + i,
          requiredLevel: 8 - i,
          timeToLearn: `${2 + i}-${3 + i} months`,
          description: `Essential skill for ${reportData.major || "your field"}`,
          resources: []
        })
      }
    }

    // Extract market insight from salary table
    const salaryTableMatch = content.match(
      /\| 50th \| \$([0-9,]+) \|/i
    ) || content.match(
      /50th.*?\$([0-9,]+)/i
    )
    const salary = salaryTableMatch ? salaryTableMatch[1] : "55,000"

    const marketInsight = `Current market analysis shows entry-level positions at $${salary} median salary with growing demand for specialized skills.`

    // Extract quick win from Next 48 Hours section
    const quickWinMatch = content.match(
      /## 🎯 Next 48 Hours[\s\S]*?1\.\s*\*\*([^*]+)\*\*/i
    ) || content.match(
      /### Next 48 Hours[\s\S]*?1\.\s*([^\n]*)/i
    )
    const quickWin = quickWinMatch
      ? quickWinMatch[1].replace(/\[|\]/g, "")
      : "Start building your first portfolio project today"

    return {
      topGaps,
      overallReadiness,
      estimatedTimeToReady: timeToReady,
      quickWin,
      marketInsight,
      contentPreview: content.slice(0, Math.floor(content.length * 0.10))
    }
  } catch (error) {
    console.error("Error extracting preview data:", error)
    // Return safe fallback
    return {
      topGaps: [],
      overallReadiness: 50,
      estimatedTimeToReady: "6-12 months",
      quickWin: "Complete your assessment to get personalized recommendations",
      marketInsight: "Market analysis is being generated for your major"
    }
  }
}
