import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { AssessmentSchema } from '@/lib/validation/schemas'
import { kv } from '@/lib/cloudflare/kv'

// export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {

    console.log("Received assessment submission request");
    const body = await request.json()
    const { sessionId, responses } = body
    
    // Validate assessment data
    const validation = AssessmentSchema.safeParse(responses)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid assessment data', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single() as { data: { id: string } | null; error: any }
    
    if (sessionError || !session) {
      console.error("Session not found for sessionId:", sessionId, "Error:", sessionError)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    // Save assessment responses
    const { data: responseData, error: responseError } = await supabase
      .from('assessment_responses')
      .insert({
        session_id: session.id,
        major: validation.data.major,
        university: validation.data.university,
        target_role: validation.data.targetRole,
        graduation_year: validation.data.graduationYear,
        current_skills: validation.data.currentSkills,
        learning_style: validation.data.learningStyle,
        time_availability: validation.data.timeAvailability,
        career_concerns: validation.data.careerConcerns
      })
      .select()
      .single()
    
    if (responseError) throw responseError
    
    // Update session status
    await supabase
      .from('assessment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', session?.id || '')
    
    // Cache the response for quick preview generation
    await kv.put(
      `assessment:${sessionId}`,
      JSON.stringify(responseData),
      { expirationTtl: 3600 } // 1 hour cache
    )
    
    // Track analytics
    await supabase
      .from('analytics_events')
      .insert({
        session_id: sessionId,
        event_name: 'assessment_completed',
        event_properties: {
          response_id: responseData.id,
          major: validation.data.major,
          target_role: validation.data.targetRole,
        } as any
      })
    
    // Trigger free report generation (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/report/free/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        major: validation.data.major
      })
    }).catch(error => {
      console.error('Failed to trigger free report generation:', error)
    })
    
    // Trigger free prompts generation (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/prompts/free/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        major: validation.data.major
      })
    }).catch(error => {
      console.error('Failed to trigger free prompts generation:', error)
    })
    
    return NextResponse.json({
      success: true,
      responseId: responseData.id,
      sessionId: session.id,
      major: validation.data.major
    })
    
  } catch (error) {
    console.error('Assessment submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    )
  }
}