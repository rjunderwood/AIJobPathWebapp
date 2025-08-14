import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { getClientInfo } from '@/lib/utils/request'

export const runtime = 'edge' // Use Cloudflare Workers

const SessionSchema = z.object({
  sessionId: z.string().min(10),
  source: z.string().optional(),
  device: z.enum(['mobile', 'desktop', 'tablet']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = SessionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      )
    }
    
    const { sessionId, source, device } = validation.data
    const clientInfo = getClientInfo(request)
    
    const supabase = createClient()
    
    // Check if session exists
    const { data: existing } = await supabase
      .from('assessment_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single()
    
    if (existing) {
      return NextResponse.json({ sessionId: existing.id })
    }
    
    // Create new session
    const { data, error } = await supabase
      .from('assessment_sessions')
      .insert({
        session_id: sessionId,
        conversion_source: source || 'direct',
        device_type: device || clientInfo.device,
        browser: clientInfo.browser,
        ip_address: clientInfo.ip,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ 
      sessionId: data.id,
      isNew: true 
    })
    
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}