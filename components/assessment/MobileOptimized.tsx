"use client"

import { useEffect } from "react"

interface MobileOptimizedProps {
  children: React.ReactNode
}

export function MobileOptimized({ children }: MobileOptimizedProps) {
  useEffect(() => {
    // Prevent pull-to-refresh on mobile
    let lastTouchY = 0
    let preventPullToRefresh = false

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      lastTouchY = e.touches[0].clientY
      preventPullToRefresh = window.pageYOffset === 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY
      const touchYDelta = touchY - lastTouchY
      lastTouchY = touchY

      if (preventPullToRefresh && touchYDelta > 0) {
        e.preventDefault()
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: false })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
    }
  }, [])

  return (
    <div className="mobile-optimized">
      {children}
      <style jsx global>{`
        .mobile-optimized {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* Optimize for mobile keyboards */
        @media (max-width: 768px) {
          input, textarea {
            font-size: 16px !important; /* Prevent zoom on iOS */
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Better touch targets */
        button, a {
          min-height: 44px;
          min-width: 44px;
        }
      `}</style>
    </div>
  )
}