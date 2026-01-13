"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Validation functions
const validateEmail = (email: string): string => {
  if (!email.trim()) {
    return "Email is required"
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address"
  }
  return ""
}

const validatePassword = (password: string): string => {
  if (!password) {
    return "Password is required"
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters"
  }
  return ""
}

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const formRef = useRef<HTMLFormElement>(null)

  // Clear form on mount
  useEffect(() => {
    setEmail("")
    setPassword("")
    setTouched({ email: false, password: false })
    setErrors({ email: "", password: "" })
    if (formRef.current) {
      formRef.current.reset()
    }
  }, [])

  // Validate fields on change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }))
    }
  }

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
    } else if (field === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ email: true, password: true })

    // Validate all fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    setErrors({
      email: emailError,
      password: passwordError,
    })

    // Don't submit if there are errors
    if (emailError || passwordError) {
      return
    }

    setIsLoading(true)

    console.log("🎉 Sign In Form Submitted", {
      email,
      password: "••••••••",
      actualPassword: password,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    })

    // Simulate submission delay
    setTimeout(() => {
      setIsLoading(false)
      setEmail("")
      setPassword("")
      setTouched({ email: false, password: false })
      setErrors({ email: "", password: "" })
      if (formRef.current) {
        formRef.current.reset()
      }
      alert("✅ Sign in data logged to console! Check the browser console (F12).")
    }, 1200)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          Email Address <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => handleBlur("email")}
          autoComplete="off"
          required
          className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 transition-all duration-300 focus:bg-card focus:outline-none ${
            touched.email && errors.email
              ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
              : "border-border/60 focus:border-primary/50 focus:shadow-lg"
          }`}
        />
        {touched.email && errors.email && (
          <p className="text-xs text-destructive animate-fade-in mt-1">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.25s" }}>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-semibold text-foreground">
            Password <span className="text-destructive">*</span>
          </label>
          <button
            type="button"
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            onClick={() => console.log("Forgot password clicked")}
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => handleBlur("password")}
          autoComplete="new-password"
          required
          className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 transition-all duration-300 focus:bg-card focus:outline-none ${
            touched.password && errors.password
              ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
              : "border-border/60 focus:border-primary/50 focus:shadow-lg"
          }`}
        />
        {touched.password && errors.password && (
          <p className="text-xs text-destructive animate-fade-in mt-1">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-lg font-semibold text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg animate-fade-in cursor-pointer"
        style={{ animationDelay: "0.35s" }}
        disabled={isLoading || !!errors.email || !!errors.password || !email.trim() || !password.trim()}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></span>
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
