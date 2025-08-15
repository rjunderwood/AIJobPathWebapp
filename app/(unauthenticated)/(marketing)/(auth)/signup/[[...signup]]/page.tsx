"use client"

import { signUp, signInWithGoogle } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleIcon } from "@/components/icons/google"
import { Star, Users, BookOpen, Trophy, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useFormStatus } from "react-dom"
import { useState } from "react"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  )
}

export default function SignUpPage({ 
  searchParams 
}: { 
  searchParams: { session?: string; redirect?: string } 
}) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    // Add redirect info to form data if present
    if (searchParams.redirect) {
      formData.append('redirect', searchParams.redirect)
    }
    if (searchParams.session) {
      formData.append('sessionId', searchParams.session)
    }
    
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left side - Benefits */}
        <motion.div
          className="hidden space-y-8 lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            <motion.h1
              className="text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {searchParams.session 
                ? "Unlock Your Complete Career Report"
                : "Build your next big idea"
              }
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {searchParams.session
                ? "Sign up free to reveal your full skill gap analysis and get AI prompts that accelerate your career."
                : "Get instant access to a production-ready app template with everything you need to launch quickly."
              }
            </motion.p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: BookOpen,
                title: "Full Stack Ready",
                desc: "Complete setup included"
              },
              {
                icon: Users,
                title: "Authentication",
                desc: "Supabase pre-configured"
              },
              {
                icon: Trophy,
                title: "Production Ready",
                desc: "Launch immediately"
              },
              {
                icon: Star,
                title: "Best Practices",
                desc: "Modern architecture"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-card rounded-lg border p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <feature.icon className="text-primary mb-2 h-5 w-5" />
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="text-muted-foreground text-xs">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <motion.div
            className="bg-muted/30 space-y-6 rounded-xl border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-muted-foreground ml-2 text-sm">
                4.9/5 (2,000+ developers)
              </span>
            </div>
            <div className="space-y-3">
              {[
                "Full authentication flow setup",
                "Database & schema configured",
                "Production deployment ready",
                "All UI components included",
                "Built with Next.js 15"
              ].map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                >
                  <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Sign up form */}
        <motion.div
          className="mx-auto w-full max-w-md lg:mx-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-8 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="mb-2 text-2xl font-semibold">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <Link
                  href="/login"
                  className="text-primary font-medium transition-colors hover:underline"
                >
                  Sign in here
                  <ArrowRight className="ml-1 inline h-3 w-3" />
                </Link>
              </motion.span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            <motion.div
              className="from-brand-primary/20 to-brand-secondary/20 absolute -inset-1 rounded-lg bg-gradient-to-r opacity-50 blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative bg-card rounded-lg border p-6">
              <form action={signInWithGoogle} className="mb-4">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                >
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </form>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or sign up with email
                  </span>
                </div>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    minLength={6}
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <SubmitButton />
                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}