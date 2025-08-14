import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const runtime = 'edge'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  httpClient: Stripe.createFetchHttpClient(), // Use fetch for edge runtime
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email, userId } = await request.json()
    
    const supabase = createClient()
    
    // Handle customer creation
    let customerId: string | undefined
    
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()
      
      customerId = profile?.stripe_customer_id as string | undefined
    }
    
    if (!customerId && email) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          sessionId,
          userId: userId || 'pending'
        }
      })
      customerId = customer.id
      
      if (userId) {
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)
      }
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: !customerId ? email : undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Career Gap Analysis',
              description: 'Personalized skill gap analysis & learning roadmap',
              images: [`${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`],
            },
            unit_amount: 1900, // $19.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/assessment/preview?session=${sessionId}`,
      metadata: {
        assessmentSessionId: sessionId,
        userId: userId || 'pending',
        email,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })
    
    // Save payment record if user exists
    if (userId) {
      await supabase.from('payments').insert({
        user_id: userId,
        session_id: sessionId,
        stripe_session_id: session.id,
        amount: 1900,
        status: 'pending',
      })
    }
    
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
    
  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}