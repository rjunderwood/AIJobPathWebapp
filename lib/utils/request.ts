import { NextRequest } from "next/server"

export function getClientInfo(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || ""
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown"
  
  // Detect device type
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  const isTablet = /tablet|ipad/i.test(userAgent)
  const device = isMobile ? "mobile" : isTablet ? "tablet" : "desktop"
  
  // Detect browser
  let browser = "unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Edge")) browser = "Edge"
  
  return {
    ip,
    device,
    browser,
    userAgent
  }
}