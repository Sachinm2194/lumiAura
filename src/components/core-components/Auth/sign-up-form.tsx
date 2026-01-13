"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Validation functions
const validateFirstName = (firstName: string): string => {
  if (!firstName.trim()) {
    return "First name is required"
  }
  return ""
}

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
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter"
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter"
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number"
  }
  return ""
}

const validateConfirmPassword = (confirmPassword: string, password: string): string => {
  if (!confirmPassword) {
    return "Please confirm your password"
  }
  if (confirmPassword !== password) {
    return "Passwords do not match"
  }
  return ""
}

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [errors, setErrors] = useState({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const formRef = useRef<HTMLFormElement>(null)

  // Clear form on mount
  useEffect(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    setTouched({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      confirmPassword: false,
    })
    setErrors({
      firstName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    if (formRef.current) {
      formRef.current.reset()
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validate on change if field is touched
    if (touched[name as keyof typeof touched]) {
      if (name === "firstName") {
        setErrors((prev) => ({ ...prev, firstName: validateFirstName(value) }))
      } else if (name === "email") {
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }))
      } else if (name === "password") {
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(value),
          confirmPassword: formData.confirmPassword
            ? validateConfirmPassword(formData.confirmPassword, value)
            : prev.confirmPassword,
        }))
      } else if (name === "confirmPassword") {
        setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(value, formData.password) }))
      }
    }
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))

    if (field === "firstName") {
      setErrors((prev) => ({ ...prev, firstName: validateFirstName(formData.firstName) }))
    } else if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(formData.email) }))
    } else if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(formData.password),
        confirmPassword: formData.confirmPassword
          ? validateConfirmPassword(formData.confirmPassword, formData.password)
          : prev.confirmPassword,
      }))
    } else if (field === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password) }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: false,
      email: true,
      password: true,
      confirmPassword: true,
    })

    // Validate all fields
    const firstNameError = validateFirstName(formData.firstName)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)

    setErrors({
      firstName: firstNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    })

    // Don't submit if there are errors
    if (firstNameError || emailError || passwordError || confirmPasswordError) {
      return
    }

    setIsLoading(true)

    console.log("🎉 Sign Up Form Submitted", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: "••••••••",
      actualPassword: formData.password,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    })

    // Simulate submission delay
    setTimeout(() => {
      setIsLoading(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setTouched({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        confirmPassword: false,
      })
      setErrors({
        firstName: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      if (formRef.current) {
        formRef.current.reset()
      }
      alert("✅ Sign up data logged to console! Check the browser console (F12).")
    }, 1200)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-semibold text-foreground">
            First Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Jane"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={() => handleBlur("firstName")}
            autoComplete="off"
            required
            className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 transition-all duration-300 focus:bg-card focus:outline-none ${
              touched.firstName && errors.firstName
                ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
                : "border-border/60 focus:border-primary/50 focus:shadow-lg"
            }`}
          />
          {touched.firstName && errors.firstName && (
            <p className="text-xs text-destructive animate-fade-in mt-1">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-semibold text-foreground">
            Last Name
          </label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            autoComplete="off"
            required
            className="h-12 rounded-lg border border-border/60 bg-background/40 backdrop-blur-sm px-4 transition-all duration-300 focus:bg-card focus:border-primary/50 focus:shadow-lg focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.25s" }}>
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          Email Address <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
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

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.35s" }}>
        <label htmlFor="password" className="block text-sm font-semibold text-foreground">
          Password <span className="text-destructive">*</span>
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          onBlur={() => handleBlur("password")}
          autoComplete="new-password"
          required
          className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 transition-all duration-300 focus:bg-card focus:outline-none ${
            touched.password && errors.password
              ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
              : "border-border/60 focus:border-primary/50 focus:shadow-lg"
          }`}
        />
        {touched.password && errors.password ? (
          <p className="text-xs text-destructive animate-fade-in mt-1">{errors.password}</p>
        ) : (
          <p className="text-xs text-muted-foreground">At least 8 characters with uppercase, lowercase, and numbers</p>
        )}
      </div>

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.45s" }}>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">
          Confirm Password <span className="text-destructive">*</span>
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleBlur("confirmPassword")}
          autoComplete="new-password"
          required
          className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 transition-all duration-300 focus:bg-card focus:outline-none ${
            touched.confirmPassword && errors.confirmPassword
              ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
              : "border-border/60 focus:border-primary/50 focus:shadow-lg"
          }`}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="text-xs text-destructive animate-fade-in mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-lg font-semibold text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg animate-fade-in cursor-pointer"
        style={{ animationDelay: "0.55s" }}
        disabled={
          isLoading ||
          !!errors.firstName ||
          !!errors.email ||
          !!errors.password ||
          !!errors.confirmPassword ||
          !formData.firstName.trim() ||
          !formData.email.trim() ||
          !formData.password.trim() ||
          !formData.confirmPassword.trim()
        }
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></span>
            Creating Account...
          </span>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}
