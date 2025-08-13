"use client"

import { createClient } from "./client"
import { useRouter } from "next/navigation"

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  
  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }
  
  return {
    signOut
  }
}