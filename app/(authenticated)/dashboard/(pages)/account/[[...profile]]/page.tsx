"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSupabase } from "@/components/providers/supabase-provider"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (!user) return null

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("Error signing out")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/account`
      })
      
      if (error) throw error
      
      toast.success("Check your email for the password reset link")
    } catch (error) {
      toast.error("Error sending password reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="mt-1"
              />
            </div>
            
            {user.user_metadata?.first_name && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={`${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`}
                  disabled
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Security */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <Button
              onClick={handlePasswordReset}
              variant="outline"
              disabled={isLoading}
            >
              Reset Password
            </Button>
          </div>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
          <div className="space-y-4">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}