"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { handleApiError } from "@/lib/helpers/handleApiError"
import { signUp } from "@/app/api/auth/signup"

// Validation functions
const validateFirstName = (firstName: string): string => {
  if (!firstName.trim()) {
    return "First name is required"
  }
  if (firstName.trim().length < 2) {
    return "First name must be at least 2 characters"
  }
  if (firstName.trim().length > 50) {
    return "First name must be no more than 50 characters"
  }
  if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim())) {
    return "First name can only contain letters, spaces, hyphens, and apostrophes"
  }
  return ""
}

const validateEmail = (email: string): string => {
  if (!email.trim()) {
    return "Email is required"
  }
  if (email.trim().length > 255) {
    return "Email must be no more than 255 characters"
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address"
  }
  // Additional check for valid email format
  const parts = email.trim().split("@")
  if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
    return "Please enter a valid email address"
  }
  if (!parts[1].includes(".")) {
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
  if (password.length > 128) {
    return "Password must be no more than 128 characters"
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

const validateLastName = (lastName: string): string => {
  // Last name is optional, but if provided, validate format
  if (lastName.trim() && lastName.trim().length < 2) {
    return "Last name must be at least 2 characters"
  }
  if (lastName.trim() && lastName.trim().length > 50) {
    return "Last name must be no more than 50 characters"
  }
  if (lastName.trim() && !/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
    return "Last name can only contain letters, spaces, hyphens, and apostrophes"
  }
  return ""
}

const validatePhone = (phone: string): string => {
  // Phone is optional, but if provided, validate format
  if (phone.trim()) {
    // Remove spaces, dashes, and parentheses for validation
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "")
    
    // Check if it's all digits
    if (!/^\d+$/.test(cleanedPhone)) {
      return "Phone number can only contain digits, spaces, dashes, and parentheses"
    }
    
    // Check length (10 digits minimum, 15 maximum for international)
    if (cleanedPhone.length < 10) {
      return "Phone number must be at least 10 digits"
    }
    if (cleanedPhone.length > 15) {
      return "Phone number must be no more than 15 digits"
    }
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
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  })
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
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
      phone: "",
    })
    setTouched({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      confirmPassword: false,
      phone: false,
    })
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
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
      } else if (name === "lastName") {
        setErrors((prev) => ({ ...prev, lastName: validateLastName(value) }))
      } else if (name === "email") {
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }))
      } else if (name === "phone") {
        setErrors((prev) => ({ ...prev, phone: validatePhone(value) }))
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
    } else if (field === "lastName") {
      setErrors((prev) => ({ ...prev, lastName: validateLastName(formData.lastName) }))
    } else if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(formData.email) }))
    } else if (field === "phone") {
      setErrors((prev) => ({ ...prev, phone: validatePhone(formData.phone) }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: false,
      email: true,
      password: true,
      confirmPassword: true,
      phone: false,
    })

    // Validate all fields
    const firstNameError = validateFirstName(formData.firstName)
    const lastNameError = validateLastName(formData.lastName)
    const emailError = validateEmail(formData.email)
    const phoneError = validatePhone(formData.phone)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)

    setErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    })

    // Don't submit if there are errors
    if (firstNameError || lastNameError || emailError || phoneError || passwordError || confirmPasswordError) {
      return
    }

    setIsLoading(true)

    try {
      // Prepare payload matching backend API structure
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName || "",
        phone: formData.phone || "",
      }

      const response = await signUp(payload)
      
      if (response) {
        setIsLoading(false)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
        })
        setTouched({
          firstName: false,
          lastName: false,
          email: false,
          password: false,
          confirmPassword: false,
          phone: false,
        })
        setErrors({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        })
        if (formRef.current) {
          formRef.current.reset()
        }
      }
    } catch (error) {
      setIsLoading(false)
      handleApiError(error)
    }
    // Simulate submission delay
    // setTimeout(() => {
    //   setIsLoading(false)
    //   setFormData({
    //     firstName: "",
    //     lastName: "",
    //     email: "",
    //     password: "",
    //     confirmPassword: "",
    //   })
    //   setTouched({
    //     firstName: false,
    //     lastName: false,
    //     email: false,
    //     password: false,
    //     confirmPassword: false,
    //   })
    //   setErrors({
    //     firstName: "",
    //     email: "",
    //     password: "",
    //     confirmPassword: "",
    //   })
    //   if (formRef.current) {
    //     formRef.current.reset()
    //   }
    //   alert("✅ Sign up data logged to console! Check the browser console (F12).")
    // }, 1200)
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
            onBlur={() => handleBlur("lastName")}
            autoComplete="off"
            className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 transition-all duration-300 focus:bg-card focus:outline-none ${
              touched.lastName && errors.lastName
                ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
                : "border-border/60 focus:border-primary/50 focus:shadow-lg"
            }`}
          />
          {touched.lastName && errors.lastName && (
            <p className="text-xs text-destructive animate-fade-in mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.25s" }}>
        <label htmlFor="phone" className="block text-sm font-semibold text-foreground">
          Phone Number
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="1234567890"
          value={formData.phone}
          onChange={handleChange}
          onBlur={() => handleBlur("phone")}
          autoComplete="off"
          className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 transition-all duration-300 focus:bg-card focus:outline-none ${
            touched.phone && errors.phone
              ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
              : "border-border/60 focus:border-primary/50 focus:shadow-lg"
          }`}
        />
        {touched.phone && errors.phone && (
          <p className="text-xs text-destructive animate-fade-in mt-1">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
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

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <label htmlFor="password" className="block text-sm font-semibold text-foreground">
          Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur("password")}
            autoComplete="new-password"
            required
            className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 pr-12 transition-all duration-300 focus:bg-card focus:outline-none ${
              touched.password && errors.password
                ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
                : "border-border/60 focus:border-primary/50 focus:shadow-lg"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {touched.password && errors.password ? (
          <p className="text-xs text-destructive animate-fade-in mt-1">{errors.password}</p>
        ) : (
          <p className="text-xs text-muted-foreground">At least 8 characters with uppercase, lowercase, and numbers</p>
        )}
      </div>

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">
          Confirm Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlur("confirmPassword")}
            autoComplete="new-password"
            required
            className={`h-12 rounded-lg border bg-background/40 backdrop-blur-sm px-4 pr-12 transition-all duration-300 focus:bg-card focus:outline-none ${
              touched.confirmPassword && errors.confirmPassword
                ? "border-destructive focus:border-destructive/50 focus:shadow-lg"
                : "border-border/60 focus:border-primary/50 focus:shadow-lg"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
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
          !!errors.lastName ||
          !!errors.email ||
          !!errors.phone ||
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
