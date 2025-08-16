"use client"

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useState } from "react"
import { CountUp } from "@/components/ui/count-up"
import { signUp, signIn, signInWithGoogle } from "@/actions/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface MarkdownReportDisplayProps {
  content: string
  readingTimeMinutes?: number
  estimatedPages?: number
  sessionId?: string
}

export function MarkdownReportDisplay({
  content,
  readingTimeMinutes,
  estimatedPages,
  sessionId
}: MarkdownReportDisplayProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleContinueWithEmail = async () => {
    setEmailError("")
    setPasswordError("")

    if (!email.trim()) {
      setEmailError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    // Show password field after email is valid
    if (!showPassword && validateEmail(email)) {
      setShowPassword(true)
      return
    }

    if (!password.trim()) {
      setPasswordError("Please enter a password")
      return
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    
    try {
      // Try to sign in first (for existing users)
      const signInData = new FormData()
      signInData.append("email", email)
      signInData.append("password", password)
      if (sessionId) {
        signInData.append("sessionId", sessionId)
        signInData.append("redirect", `/report/${sessionId}`)
      }
      
      const signInResult = await signIn(signInData)
      
      if (signInResult?.error) {
        // If sign in fails, try to sign up
        const formData = new FormData()
        formData.append("email", email)
        formData.append("password", password)
        formData.append("firstName", "")
        formData.append("lastName", "")
        if (sessionId) {
          formData.append("sessionId", sessionId)
          formData.append("redirect", `/report/${sessionId}`)
        }
        
        const signUpResult = await signUp(formData)
        
        if (signUpResult?.error) {
          setPasswordError(signUpResult.error)
          toast.error(signUpResult.error)
        } else if (signUpResult?.success) {
          toast.success("Account created! Check your email to verify your account and access your report.")
          // Reset form to allow user to sign in after verification
          setShowPassword(false)
          setPassword("")
          setEmail("")
        }
      } else {
        // Sign in successful - the server action will handle redirect
        toast.success("Welcome back!")
      }
    } catch (error) {
      // Handle redirect errors from server actions gracefully
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        // This is expected when signIn succeeds and redirects
        return
      }
      setPasswordError("An error occurred. Please try again.")
      toast.error("Failed to authenticate")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      if (sessionId) {
        formData.append("sessionId", sessionId)
        formData.append("redirect", `/report/${sessionId}`)
      }
      await signInWithGoogle(formData)
    } catch (error) {
      // Handle redirect errors from server actions gracefully
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        // This is expected when signInWithGoogle succeeds and redirects
        return
      }
      toast.error("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  if (!content) {
    return (
      <div className="mb-12 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="py-8 text-center text-gray-600">
          Your personalized report is being generated...
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-12 overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
    >
      <h1 className="mb-6 border-b-2 border-blue-200 pb-3 text-3xl font-bold text-gray-900">
        Your Report
        <span className="ml-3 text-lg font-normal text-gray-500">
          {readingTimeMinutes &&
            readingTimeMinutes > 0 &&
            estimatedPages &&
            estimatedPages > 0 && (
              <>
                ({estimatedPages} pages • {readingTimeMinutes} min read)
              </>
            )}
          {readingTimeMinutes &&
            readingTimeMinutes > 0 &&
            (!estimatedPages || estimatedPages === 0) && (
              <>({readingTimeMinutes} min read)</>
            )}
          {estimatedPages &&
            estimatedPages > 0 &&
            (!readingTimeMinutes || readingTimeMinutes === 0) && (
              <>({estimatedPages} pages)</>
            )}
        </span>
      </h1>
      <div className="prose prose-gray relative max-w-none pb-32">
        {/* Fade overlay */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-[48rem] bg-gradient-to-t from-white via-white/70 via-white/95 to-transparent" />

        {/* Floating CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 left-1/2 z-20 w-[95%] max-w-5xl -translate-x-1/2 transform overflow-visible rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/95 to-indigo-50/95 p-8 pb-28 shadow-2xl backdrop-blur-sm"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
            {/* Left side - Text content */}
            <div className="flex-1 text-left">
              {/* <p className="mb-2 text-sm text-gray-600 md:text-base">
                Ready to unlock your full career potential?
              </p> */}
              <h3 className="mb-3 text-xl font-bold text-gray-900 md:text-2xl">
                Continue With An Account
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-base md:text-lg">✅</span>
                  <p className="text-base text-gray-700 md:text-lg">
                    View And Download Your Free{" "}
                    <strong>Full {estimatedPages} Page Report</strong> + Your
                    Free <strong>AI Tooling Prompts</strong> for Your Career
                  </p>
                </div>
                <div className="ml-6 text-lg font-bold text-purple-600 md:ml-7 md:text-xl">
                  +
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-base md:text-lg">🚀</span>
                  <p className="text-base text-gray-700 md:text-lg">
                    Unlock Your Highly{" "}
                    <strong>Personalised Analysis Report</strong> +{" "}
                    <strong>Advanced AI Tooling Prompts</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Divider - only visible on medium screens and up */}
            <div className="mx-2 hidden h-28 w-px bg-purple-300 md:block" />

            {/* Right side - Sign in elements */}
            <div className="flex flex-col gap-3 md:w-64 lg:w-80">
              <p className="text-sm text-gray-600 text-center">
                <CountUp end={142} duration={2.5} className="font-bold text-purple-600" /> people have downloaded their report in the past 24 hours
              </p>
              <div className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      setEmailError("")
                    }}
                    className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                      emailError ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>
                {showPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value)
                        setPasswordError("")
                      }}
                      autoFocus
                      className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                        passwordError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 6 characters
                    </p>
                  </motion.div>
                )}
                <button
                  onClick={handleContinueWithEmail}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading 
                    ? "Creating account..." 
                    : showPassword 
                      ? "Create Account" 
                      : "Continue with Email"
                  }
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gradient-to-r from-purple-50/95 to-indigo-50/95 px-2 text-gray-500">
                    or
                  </span>
                </div>
              </div>
              <button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? "Signing in..." : "Continue with Google"}
              </button>
              <p className="mt-2 text-center text-xs text-gray-500">
                By continuing you agree to AIJobPath's{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-purple-600 underline hover:text-purple-700"
                >
                  privacy policy
                </a>{" "}
                and{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-purple-600 underline hover:text-purple-700"
                >
                  terms of use
                </a>
              </p>
            </div>
          </div>
        </motion.div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for headings
            h1: ({ children }) => (
              <h1 className="mb-6 border-b-2 border-blue-200 pb-3 text-3xl font-bold text-gray-900">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-8 mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900"
              >
                {children}
              </motion.h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-6 mb-3 text-xl font-semibold text-gray-800">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="mt-4 mb-2 text-lg font-medium text-gray-700">
                {children}
              </h4>
            ),

            // Custom styling for paragraphs
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
            ),

            // Custom styling for lists
            ul: ({ children }) => (
              <ul className="mb-4 space-y-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-4 list-inside list-decimal space-y-2">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start space-x-2">
                <span className="mt-1 font-medium text-blue-600">•</span>
                <span className="text-gray-700">{children}</span>
              </li>
            ),

            // Custom styling for blockquotes
            blockquote: ({ children }) => (
              <blockquote className="my-6 rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                <div className="font-medium text-gray-800">{children}</div>
              </blockquote>
            ),

            // Custom styling for tables
            table: ({ children }) => (
              <div className="my-6 overflow-x-auto">
                <table className="min-w-full rounded-lg border border-gray-200 bg-white">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-700">
                {children}
              </td>
            ),

            // Custom styling for code
            code: ({ children, ...props }) => {
              const isInline = !props.className?.includes("language-")
              return isInline ? (
                <code className="rounded bg-gray-100 px-2 py-1 text-sm font-medium text-blue-600">
                  {children}
                </code>
              ) : (
                <code className="block overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  {children}
                </code>
              )
            },

            // Custom styling for strong/bold text
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">
                {children}
              </strong>
            ),

            // Custom styling for emphasis/italic
            em: ({ children }) => (
              <em className="text-gray-600 italic">{children}</em>
            ),

            // Custom styling for horizontal rules
            hr: () => <hr className="my-8 border-t-2 border-gray-200" />,

            // Custom styling for links
            a: ({ href, children }) => (
              <a
                href={href}
                className="font-medium text-blue-600 underline hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  )
}
