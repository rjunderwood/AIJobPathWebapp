import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/admin"
import { getOpenAIClient } from "@/lib/openai/client"
import { getPaidAssessmentPrompt } from "@/lib/prompts/paid-assessment-prompt"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { userId, responseId } = await request.json()

    if (!userId || !responseId) {
      return NextResponse.json(
        { error: "User ID and Response ID are required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if premium report already exists for this user and response
    const { data: existingReport } = await supabase
      .from("premium_reports")
      .select("*")
      .eq("user_id", userId)
      .eq("response_id", responseId)
      .single()

    if (existingReport) {
      return NextResponse.json({
        report: existingReport.report_data,
        cached: true,
        reportId: existingReport.id
      })
    }

    // Get assessment response data
    const { data: assessmentResponse, error: responseError } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("id", responseId)
      .single()

    if (responseError || !assessmentResponse) {
      return NextResponse.json(
        { error: "Assessment response not found" },
        { status: 404 }
      )
    }

    // Calculate months to graduation
    const currentDate = new Date()
    const graduationYear = assessmentResponse.graduation_year as number
    const graduationDate = new Date(graduationYear, 5, 1) // Assume June graduation
    const monthsToGraduation = Math.max(
      0,
      Math.floor(
        (graduationDate.getTime() - currentDate.getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      )
    )

    // Generate personalized report with OpenAI
    const openai = getOpenAIClient()
    const startTime = Date.now()

    const prompt = getPaidAssessmentPrompt({
      major: assessmentResponse.major as string,
      university: assessmentResponse.university as string,
      targetRole: assessmentResponse.target_role as string,
      graduationYear: graduationYear.toString(),
      currentSkills:
        (assessmentResponse.current_skills as string[] | null)?.join(", ") ||
        "None specified",
      learningStyle:
        (assessmentResponse.learning_style as string | null) || "Not specified",
      timeAvailability:
        (assessmentResponse.time_availability as string | null) ||
        "Not specified",
      careerConcerns:
        (assessmentResponse.career_concerns as string | null) ||
        "Not specified",
      currentDate: currentDate.toISOString().split("T")[0],
      monthsToGraduation: monthsToGraduation.toString()
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini-2025-08-07",
      messages: [
        {
          role: "system",
          content:
            "You are a personal AI career strategist creating a forensically personalized career gap analysis. Generate an intensely personalized report that feels like a $10,000 consulting engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 1
      // max_completion_tokens: 8000, // More tokens for detailed personalized report
    })

    const reportContent = completion.choices[0].message.content || ""
    const generationTime = Date.now() - startTime

    // Parse and structure the report
    const reportData = {
      userId,
      responseId,
      major: assessmentResponse.major,
      university: assessmentResponse.university,
      targetRole: assessmentResponse.target_role,
      content: reportContent,
      sections: parseDetailedReportSections(reportContent),
      personalizedInsights: {
        monthsToGraduation,
        currentSkills: assessmentResponse.current_skills,
        learningStyle: assessmentResponse.learning_style,
        timeAvailability: assessmentResponse.time_availability,
        careerConcerns: assessmentResponse.career_concerns
      },
      generatedAt: new Date().toISOString()
    }

    // Save to database
    const { data: newReport, error: dbError } = await supabase
      .from("premium_reports")
      .insert({
        user_id: userId,
        response_id: responseId,
        report_data: reportData,
        ai_tokens_used: completion.usage?.total_tokens,
        generation_time_ms: generationTime
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database save error:", dbError)
      return NextResponse.json(
        { error: "Failed to save report" },
        { status: 500 }
      )
    }

    // Trigger premium prompts generation
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/prompts/premium/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          responseId
        })
      }
    ).catch(error => {
      console.error("Failed to trigger premium prompts generation:", error)
    })

    return NextResponse.json({
      report: reportData,
      cached: false,
      reportId: newReport.id,
      generationTime
    })
  } catch (error) {
    console.error("Premium report generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate premium report" },
      { status: 500 }
    )
  }
}

function parseDetailedReportSections(content: string): any {
  const sections: any = {}

  // Parse major sections with more detail
  const sectionPattern = /##?\s*([^#\n]+)\n([\s\S]*?)(?=##?\s*[^#\n]+\n|$)/g
  let match

  while ((match = sectionPattern.exec(content)) !== null) {
    const sectionTitle = match[1].trim()
    const sectionContent = match[2].trim()

    const sectionKey = sectionTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "_")

    // Parse subsections within each section
    const subsections: any[] = []
    const subsectionPattern =
      /###\s*([^#\n]+)\n([\s\S]*?)(?=###\s*[^#\n]+\n|##|$)/g
    let subMatch

    while ((subMatch = subsectionPattern.exec(sectionContent)) !== null) {
      subsections.push({
        title: subMatch[1].trim(),
        content: subMatch[2].trim()
      })
    }

    sections[sectionKey] = {
      title: sectionTitle,
      content: sectionContent,
      subsections: subsections.length > 0 ? subsections : undefined
    }
  }

  return sections
}
