import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { getOpenAIClient } from '@/lib/openai/client'
import { kv } from '@/lib/cloudflare/kv'
import { generatePreviewPrompt } from '@/lib/openai/prompts'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    // Check KV cache first
    const cached = await kv.get(`preview:${sessionId}`)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }
    
    // Get assessment from cache or database
    let assessmentData = await kv.get(`assessment:${sessionId}`)
    
    if (!assessmentData) {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      
      if (error || !data) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        )
      }
      assessmentData = JSON.stringify(data)
    }
    
    const responses = JSON.parse(assessmentData)
    
    // Generate preview with OpenAI
    const openai = getOpenAIClient()
    const startTime = Date.now()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: generatePreviewPrompt()
        },
        {
          role: 'user',
          content: `
          Student Profile:
          - Major: ${responses.major}
          - Target Role: ${responses.target_role}
          - University: ${responses.university}
          - Graduation: ${responses.graduation_year}
          - Current Skills: ${responses.current_skills?.join(', ') || 'None specified'}
          - Time Available: ${responses.time_availability}
          - Career Concern: ${responses.career_concerns || 'Not specified'}
          `
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })
    
    const previewData = JSON.parse(completion.choices[0].message.content || '{}')
    const generationTime = Date.now() - startTime
    
    // Save to database
    const supabase = createClient()
    await supabase.from('previews').insert({
      session_id: sessionId,
      response_id: responses.id,
      preview_data: previewData,
      ai_tokens_used: completion.usage?.total_tokens,
      generation_time_ms: generationTime
    })
    
    // Cache the preview
    await kv.put(
      `preview:${sessionId}`,
      JSON.stringify(previewData),
      { expirationTtl: 86400 } // 24 hour cache
    )
    
    return NextResponse.json(previewData)
    
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}