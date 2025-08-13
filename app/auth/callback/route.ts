import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { createCustomer, getCustomerByUserId } from "@/actions/customers"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if customer record exists
      const existingCustomer = await getCustomerByUserId(data.user.id)
      
      // Create customer record for new OAuth users
      if (!existingCustomer) {
        await createCustomer(data.user.id)
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}