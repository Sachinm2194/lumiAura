"use client"

import Link from "next/link"
import ProductCarousel from "@/components/core-components/Auth/product-carousel"
import SignUpForm from "@/components/core-components/Auth/sign-up-form"
import GoogleOAuthButton from "@/components/core-components/google-oauth-button"

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/8 overflow-hidden relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Large morphing orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-accent/12 to-primary/10 blur-3xl animate-morphing"></div>
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-br from-primary/12 to-accent/8 blur-3xl animate-morphing"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating accent orbs */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-secondary/6 blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/8 blur-3xl animate-float-slow"
          style={{ animationDelay: "1.5s" }}
        ></div>

        {/* Small accent elements */}
        <div
          className="absolute top-20 left-20 w-40 h-40 rounded-full bg-primary/10 blur-2xl animate-bounce"
          style={{ animationDelay: "0.7s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/2 w-32 h-32 rounded-full bg-accent/8 blur-2xl animate-bounce"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Main Container */}
      <div className="flex items-center justify-center min-h-screen p-1 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl w-full items-center">
          {/* Left side - Product Showcase */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-8 animate-slide-in-left">
            <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent animate-gradient">
                Start Your Glow Journey
              </h2>
              <p className="text-lg text-muted-foreground max-w-sm">
                Join our community of skincare enthusiasts discovering their best self
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
                <h6 className="text-3xl  md:text-4xl font-bold text-foreground">Create Your Account</h6>
                <p className="text-sm text-muted-foreground">Start your personalized skincare transformation</p>
              </div>

              {/* Form Card */}
              <div
                className="bg-card/80 backdrop-blur-md rounded-2xl p-8 lg:p-10 shadow-2xl border border-border/60 animate-glow-accent"
                style={{ animationDelay: "0.5s" }}
              >
                <SignUpForm />

                {/* Divider */}
                {/* <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/40"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-card text-muted-foreground font-medium">or sign up with</span>
                  </div>
                </div> */}

                {/* Gmail Sign Up */}
                {/* <GoogleOAuthButton 
                  text="Sign up with Google"
                  variant="outline"
                /> */}
              </div>

              {/* Footer */}
              <div
                className="text-center text-sm text-muted-foreground space-y-3 animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                <p>
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </p>
                <p className="text-xs pt-2">
                  By signing up, you agree to our{" "}
                  <button className="text-primary hover:underline">Terms of Service</button> and{" "}
                  <button className="text-primary hover:underline">Privacy Policy</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
