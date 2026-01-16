"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react"
import { emailVerify } from "@/app/api/auth/emai-verify"
import { Button } from "@/components/ui/button"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState("verifying") // verifying | success | error

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error")
        return
      }
      try {
        const response = await emailVerify(token)
        if (response) {
          setStatus("success")
          setTimeout(() => router.push("/sign-in"), 3000)
        } else {
          setStatus("error")
        }
      } catch (error) {
        setStatus("error")
      }
    }
    verifyEmail()
  }, [token, router])
   

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
                <div className="absolute inset-0 bg-success/20 rounded-full scale-0 animate-pulse"></div>
                <CheckCircle className="h-10 w-10 text-success relative z-10" />
              </div>
            )}
            {status === "error" && (
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-destructive/20 rounded-full scale-0 animate-pulse"></div>
                <XCircle className="h-10 w-10 text-destructive relative z-10" />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              {status === "verifying" && "Verifying your email"}
              {status === "success" && "Email verified!"}
              {status === "error" && "Verification failed"}
            </h1>
          </div>

          {/* Message */}
          <p className="text-muted-foreground text-base leading-relaxed">
            {status === "verifying" && "Please wait while we confirm your email address."}
            {status === "success" && "Your email has been successfully verified. Redirecting you to login..."}
            {status === "error" && "This verification link is invalid or has expired. Please request a new one."}
          </p>

          {/* Progress indicator for verifying state */}
          {status === "verifying" && (
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Action Buttons */}
          {status === "error" && (
            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 font-semibold hover:opacity-90 active:scale-95 transition-all duration-200 mt-4"
            >
              <Mail className="h-5 w-5" />
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {status === "success" && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-muted-foreground">Redirecting in 3 seconds…</p>
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subtle footer message */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          {/* {status === "error" && "Need help? Contact support@example.com"} */}
          {status === "success" && "Your account is now active"}
          {status === "verifying" && "This may take a few moments"}
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-primary/5 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 sm:p-10 text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
