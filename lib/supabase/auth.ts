import { createClient } from "./server"
import { redirect } from "next/navigation"

export async function currentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Map Supabase user to match the format expected by the app
  return {
    id: user.id,
    firstName: user.user_metadata?.first_name || null,
    lastName: user.user_metadata?.last_name || null,
    username: user.user_metadata?.username || null,
    emailAddresses: [{ emailAddress: user.email || "" }],
    imageUrl: user.user_metadata?.avatar_url || null
  }
}

export async function auth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return {
    userId: user?.id || null,
    redirectToSignIn: () => redirect("/login")
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}