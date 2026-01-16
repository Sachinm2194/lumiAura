"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getCurrentUser } from "@/app/api/auth/verify-user"
import { logout as logoutApi } from "@/app/api/auth/logout"

// User data type
export interface User {
  id: number
  email: string
  role: string
}

// Auth context state type
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true) // Start with true for initial check

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const userData = await getCurrentUser()
        
        if (userData) {
          // User is authenticated, restore user data
          setUser(userData)
        } else {
          // User is not authenticated, keep user as null
          setUser(null)
        }
      } catch (error) {
        // Error already handled in getCurrentUser, just set user to null
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, []) // Run only once on mount

  // Listen for session expiration events from axios interceptor
  useEffect(() => {
    const handleLogout = (event: CustomEvent) => {
      // Clear user state when session expires
      setUser(null)
    }

    window.addEventListener("auth:logout", handleLogout as EventListener)

    return () => {
      window.removeEventListener("auth:logout", handleLogout as EventListener)
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      // Call backend to clear HTTP-only cookie
      await logoutApi()
    } catch (error) {
      // Error already handled in logoutApi
    } finally {
      // Always clear local state, even if API call fails
      setUser(null)
    }
  }

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

