import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { getOpenAIClient } from '@/lib/openai/client'
import { getFreeAssessmentPrompt } from '@/lib/prompts/free-assessment-prompt'
import { kv } from '@/lib/cloudflare/kv'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, major } = await request.json()
    
    if (!major) {
      return NextResponse.json(
        { error: 'Major is required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Check if free report already exists for this major
    const { data: existingReport } = await supabase
      .from('free_reports')
      .select('*')
      .eq('major', major)
      .single()
    
    if (existingReport) {
      // Return cached report
      return NextResponse.json({
        report: existingReport.report_data,
        cached: true,
        reportId: existingReport.id
      })
    }
    
    // Check KV cache as fallback
    const cacheKey = `free-report:${major.toLowerCase().replace(/\s+/g, '-')}`
    const cached = await kv.get(cacheKey)
    if (cached) {
      const reportData = JSON.parse(cached)
      
      // Save to database for persistence
      const { data: newReport } = await supabase
        .from('free_reports')
        .insert({
          major,
          report_data: reportData,
        })
        .select()
        .single()
      
      return NextResponse.json({
        report: reportData,
        cached: true,
        reportId: newReport?.id
      })
    }
    
    // Generate new report with OpenAI
    const openai = getOpenAIClient()
    const startTime = Date.now()
    
    const prompt = getFreeAssessmentPrompt({
      major,
      currentDate: new Date().toISOString().split('T')[0]
    })
    
    console.log('Prompt Debug:', {
      major,
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 300)
    })
    
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career advisor specializing in helping college students. Generate a comprehensive report following the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 1,
        // max_completion_tokens: 8000,
      })
      
      console.log('Raw OpenAI Response:', {
        id: completion.id,
        object: completion.object,
        created: completion.created,
        model: completion.model,
        usage: completion.usage,
        choices: completion.choices?.map(choice => ({
          index: choice.index,
          finish_reason: choice.finish_reason,
          message: {
            role: choice.message.role,
            content: choice.message.content ? `${choice.message.content.length} chars` : 'null/empty'
          }
        }))
      })
      
    } catch (apiError: any) {
      console.error('OpenAI API Error:', apiError)
      throw new Error(`OpenAI API failed: ${apiError?.message || 'Unknown error'}`)
    }
    
    if (!completion.choices || completion.choices.length === 0) {
      console.error('No choices in completion:', completion)
      throw new Error('No choices returned from OpenAI')
    }
    
    const reportContent = completion.choices[0].message.content || ''
    const generationTime = Date.now() - startTime
    
    // Debug logging
    console.log('Content Processing Debug:', {
      rawContent: completion.choices[0].message.content,
      processedContent: reportContent,
      contentLength: reportContent.length,
      isNull: completion.choices[0].message.content === null,
      isUndefined: completion.choices[0].message.content === undefined,
      isEmpty: completion.choices[0].message.content === '',
      tokenUsage: completion.usage,
      finishReason: completion.choices[0].finish_reason
    })
    
    if (!reportContent || reportContent.trim().length === 0) {
      console.error('Empty content received from OpenAI - this may be due to reasoning model hitting token limit')
      
      // Check if this is a reasoning model that hit the limit
      if (completion.usage?.completion_tokens_details?.reasoning_tokens && 
          completion.usage.completion_tokens_details.reasoning_tokens > 0 && 
          completion.choices[0].finish_reason === 'length') {
        throw new Error('Reasoning model hit token limit - increase max_completion_tokens or use different model')
      }
      
      throw new Error('OpenAI returned empty content')
    }
    
    // Parse the report content into structured data
    const reportData = {
      major,
      content: reportContent,
      sections: parseReportSections(reportContent),
      generatedAt: new Date().toISOString()
    }
    
    // Save to database
    const { data: newReport, error: dbError } = await supabase
      .from('free_reports')
      .insert({
        major,
        report_data: reportData,
        ai_tokens_used: completion.usage?.total_tokens,
        generation_time_ms: generationTime
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('Database save error:', dbError)
    }
    
    // Cache in KV for fast access
    await kv.put(
      cacheKey,
      JSON.stringify(reportData),
      { expirationTtl: 2592000 } // 30 days cache
    )
    
    // Link to session if provided
    if (sessionId && newReport) {
      const { data: session } = await supabase
        .from('assessment_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single()
      
      if (session) {
        await supabase
          .from('assessment_sessions')
          .update({
            free_report_id: newReport.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', session?.id || '')
      }
    }
    
    return NextResponse.json({
      report: reportData,
      cached: false,
      reportId: newReport?.id,
      generationTime
    })
    
  } catch (error) {
    console.error('Free report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function parseReportSections(content: string): any {
  // Parse the markdown content into structured sections
  const sections: any = {}
  
  // Extract major sections using regex
  const sectionPattern = /##\s*([^#\n]+)\n([\s\S]*?)(?=##\s*[^#\n]+\n|$)/g
  let match
  
  while ((match = sectionPattern.exec(content)) !== null) {
    const sectionTitle = match[1].trim()
    const sectionContent = match[2].trim()
    
    // Clean up section title for use as key
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