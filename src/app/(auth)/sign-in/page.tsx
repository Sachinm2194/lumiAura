"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductCarousel from "@/components/core-components/Auth/product-carousel"
import SignInForm from "@/components/core-components/Auth/sign-in-form"
import GoogleOAuthButton from "@/components/core-components/google-oauth-button"

export default function SignIn() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated (handles browser back button and manual URL entry)
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/") // Use replace to prevent back button from going to sign-in
    }
  }, [isAuthenticated, router])

  // Redirect if authenticated
  if (isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/8 overflow-hidden relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Large morphing orbs */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/12 to-accent/10 blur-3xl animate-morphing"></div>
        <div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-accent/12 to-primary/8 blur-3xl animate-morphing"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating accent orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-secondary/6 blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-float-slow"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Small accent elements */}
        <div
          className="absolute top-10 right-10 w-40 h-40 rounded-full bg-accent/10 blur-2xl animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-32 right-1/3 w-32 h-32 rounded-full bg-primary/8 blur-2xl animate-bounce"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Main Container */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl w-full items-center">
          {/* Left side - Product Showcase */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-8 animate-slide-in-left">
            <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-gradient">
                Discover Radiant Skin
              </h2>
              <p className="text-lg text-muted-foreground max-w-sm">
                Premium skincare products crafted for your most glowing self
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <ProductCarousel />
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
            <div className="space-y-6 lg:space-y-8">
              {/* Header */}
              <div className="text-center lg:text-left space-y-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground">Welcome Back</h1>
                <p className="text-lg text-muted-foreground">Sign in to continue your skincare journey</p>
              </div>

              {/* Form Card */}
              <div
                className="bg-card/80 backdrop-blur-md rounded-2xl p-8 lg:p-10 shadow-2xl border border-border/60 animate-glow"
                style={{ animationDelay: "0.5s" }}
              >
                <SignInForm />

                {/* Divider */}
                {/* <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/40"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-card text-muted-foreground font-medium">or continue with</span>
                  </div>
                </div> */}

                {/* Gmail Sign In */}
                {/* <GoogleOAuthButton 
                  text="Sign in with Google"
                  variant="outline"
                /> */}
              </div>

              {/* Footer */}
              <div
                className="text-center text-sm text-muted-foreground space-y-3 animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                <p>
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
