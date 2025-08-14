import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { headers } from 'next/headers'

export const runtime = 'edge'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  httpClient: Stripe.createFetchHttpClient(),
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }
  
  const supabase = createClient()
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Create user if needed
        let userId = session.metadata?.userId
        
        if (userId === 'pending') {
          const email = session.customer_email || session.metadata?.email
          
          // Create user with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email!,
            email_confirm: true,
          })
          
          if (!authError && authData.user) {
            userId = authData.user.id
            
            // Create profile
            await supabase.from('profiles').insert({
              id: userId,
              email: email!,
              stripe_customer_id: session.customer as string,
            })
          }
        }
        
        // Update payment record
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent as string,
            completed_at: new Date().toISOString(),
            user_id: userId,
          })
          .eq('stripe_session_id', session.id)
        
        // Create report record
        const assessmentSessionId = session.metadata?.assessmentSessionId
        if (assessmentSessionId && userId) {
          // Get assessment response
          const { data: assessmentSession } = await supabase
            .from('assessment_sessions')
            .select('id')
            .eq('session_id', assessmentSessionId)
            .single()
            
          if (assessmentSession) {
            const { data: assessmentResponse } = await supabase
              .from('assessment_responses')
              .select('id')
              .eq('session_id', assessmentSession.id)
              .single()
            
            if (assessmentResponse) {
              await supabase.from('reports').insert({
                user_id: userId,
                response_id: assessmentResponse.id,
                status: 'generating',
              } as any)
              
              // Trigger report generation (could be a background job)
              // For now, we'll handle it synchronously
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/report/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId,
                  responseId: assessmentResponse.id,
                }),
              })
            }
          }
        }
        
        // Send magic link email for report access
        if (userId && session.customer_email) {
          await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: session.customer_email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/report/${userId}`
            }
          } as any)
        }
        
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            failure_reason: paymentIntent.last_payment_error?.message,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        break
      }
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}