"use client"

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react"
import { getCurrentUser } from "@/app/api/auth/verify-user"
import { logout as logoutApi } from "@/app/api/auth/logout"
import { refreshToken } from "@/app/api/auth/refresh"

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

  // Periodic token refresh (every 50 seconds to refresh before 1-minute expiry)
  useEffect(() => {
    if (!user) return; // Only refresh if user is logged in

    const refreshInterval = setInterval(async () => {
      try {
        // Silently refresh token in background
        await refreshToken();
        // Token refreshed successfully - new cookies set by backend
      } catch (error) {
        // Refresh failed - token might be expired, clear user state
        setUser(null);
        clearInterval(refreshInterval);
      }
    }, 50000); // Refresh every 50 seconds (before 1-minute access token expiry)

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user]); // Re-run when user changes

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    // Optimistic update - clear user state immediately for instant UI update
    setUser(null)
    
    // Call backend to clear HTTP-only cookie in background (don't wait for it)
    logoutApi().catch((error) => {
      // Error already handled in logoutApi
      // User state is already cleared, so UI is updated
    })
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

