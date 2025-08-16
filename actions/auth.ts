"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { createCustomer } from "./customers"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = formData.get("redirect") as string
  const sessionId = formData.get("sessionId") as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { error: error.message }
  }

  // Link assessment session to user if sessionId provided
  if (data.user && sessionId) {
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single()
    
    if (session) {
      await supabase
        .from('assessment_responses')
        .update({ user_id: data.user.id })
        .eq('session_id', session.id)
    }
  }

  // Redirect to the specified URL or dashboard
  redirect(redirectTo || "/dashboard")
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const redirectTo = formData.get("redirect") as string
  const sessionId = formData.get("sessionId") as string

  const supabase = await createClient()

  // Build the callback URL with redirect and session parameters
  let callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`
  const params = new URLSearchParams()
  if (redirectTo) params.append('next', redirectTo)
  if (sessionId) params.append('session', sessionId)
  if (params.toString()) callbackUrl += `?${params.toString()}`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      },
      emailRedirectTo: callbackUrl
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create customer record
    await createCustomer(data.user.id)
    
    // Link assessment session to user if sessionId provided
    if (sessionId) {
      const { data: session } = await supabase
        .from('assessment_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single()
      
      if (session) {
        await supabase
          .from('assessment_responses')
          .update({ user_id: data.user.id })
          .eq('session_id', session.id)
      }
    }
  }

  // Only redirect on successful signup
  // Note: User still needs to verify email before they can access dashboard
  return { success: true, requiresEmailVerification: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient()
  
  // Get redirect and session parameters from form data if provided
  const redirectTo = formData?.get("redirect") as string
  const sessionId = formData?.get("sessionId") as string
  
  // Build the callback URL with parameters
  let callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`
  const params = new URLSearchParams()
  if (redirectTo) params.append('next', redirectTo)
  if (sessionId) params.append('session', sessionId)
  if (params.toString()) callbackUrl += `?${params.toString()}`
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent"
      }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.url) {
    redirect(data.url)
  }
}