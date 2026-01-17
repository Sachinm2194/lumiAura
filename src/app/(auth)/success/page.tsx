"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { getCurrentUser } from "@/app/api/auth/verify-user"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const { login } = useAuth()

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let isMounted = true

    const verifyAuth = async () => {
      try {
        const userData = await getCurrentUser()

        if (!isMounted) return // Don't update state if unmounted

        if (userData) {
          // Update auth context with user data
          login({
            id: userData.id,
            email: userData.email,
            role: userData.role,
          })
          setStatus("success")

          // Redirect after short delay
          timeoutId = setTimeout(() => {
            if (!isMounted) return
            const redirectPath = redirect ? decodeURIComponent(redirect) : "/"
            router.replace(redirectPath)
          }, 2000)
        } else {
          setStatus("error")
          setErrorMessage("Authentication failed. Please try again.")
        }
      } catch (error: any) {
        if (!isMounted) return
        setStatus("error")
        setErrorMessage("Failed to verify authentication. Please try signing in again.")
      }
    }

    verifyAuth()

    // Cleanup function
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, []) // Empty dependencies - run only once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-primary/5 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-500">
          {/* Status Icon */}
          <div className="flex justify-center">
            {status === "verifying" && (
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-pulse"></div>
                <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
              </div>
            )}
            {status === "success" && (
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                <CheckCircle className="h-10 w-10 text-green-500 relative z-10" />
              </div>
            )}
            {status === "error" && (
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                <XCircle className="h-10 w-10 text-red-500 relative z-10" />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {status === "verifying" && "Verifying authentication..."}
              {status === "success" && "Authentication successful!"}
              {status === "error" && "Authentication failed"}
            </h1>
          </div>

          {/* Message */}
          <p className="text-muted-foreground text-base leading-relaxed">
            {status === "verifying" && "Please wait while we verify your authentication."}
            {status === "success" && "Redirecting you now..."}
            {status === "error" && errorMessage}
          </p>

          {/* Progress indicator for verifying state */}
          {status === "verifying" && (
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Success state - countdown */}
          {status === "success" && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-muted-foreground">Redirecting in 2 seconds…</p>
              <div className="flex gap-1 justify-center">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error state - action button */}
          {status === "error" && (
            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full cursor-pointer mt-4"
            >
              Go to Sign In
            </Button>
          )}
        </div>

        {/* Subtle footer message */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          {status === "success" && "You are now authenticated"}
          {status === "verifying" && "This may take a few moments"}
        </p>
      </div>
    </div>
  )
}

export default function AuthSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  )
}