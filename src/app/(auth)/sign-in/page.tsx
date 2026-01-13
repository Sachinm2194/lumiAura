"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductCarousel from "@/components/core-components/Auth/product-carousel"
import SignInForm from "@/components/core-components/Auth/sign-in-form"


export default function SignIn() {
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
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/40"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-card text-muted-foreground font-medium">or continue with</span>
                  </div>
                </div>

                {/* Gmail Sign In */}
                <Button
                  variant="outline"
                  className="w-full cursor-pointer h-12 rounded-xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-300 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => {
                    console.log("Gmail Sign In clicked", {
                      timestamp: new Date().toISOString(),
                    })
                  }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>
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
