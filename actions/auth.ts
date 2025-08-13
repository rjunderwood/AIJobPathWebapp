"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { createCustomer } from "./customers"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create customer record
    await createCustomer(data.user.id)
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
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