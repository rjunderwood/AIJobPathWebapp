import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // Track page views for analytics
  if (request.nextUrl.pathname.startsWith('/assessment')) {
    // Log to analytics (non-blocking)
    const analytics = {
      pathname: request.nextUrl.pathname,
      referrer: request.headers.get('referer') || '',
      userAgent: request.headers.get('user-agent') || '',
      timestamp: Date.now(),
    }
    
    // You can send this to your analytics service
    request.nextUrl.searchParams.set('analytics', JSON.stringify(analytics))
  }
  
  // Handle authentication for protected routes
  if (request.nextUrl.pathname.startsWith('/report') || 
      request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          }
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }
  
  return response
}
