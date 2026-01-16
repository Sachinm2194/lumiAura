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
    let isMounted = true; // Track if component is still mounted
    let timeoutId: NodeJS.Timeout | null = null;
    
    const checkAuth = async () => {
      try {
        console.log("[AuthContext] Starting auth check");
        setIsLoading(true)
        
        // Safety timeout - always set loading to false after 10 seconds
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn("[AuthContext] Force setting isLoading to false after 10 seconds");
            setIsLoading(false);
          }
        }, 10000);

        const userData = await getCurrentUser();
        
        // Clear safety timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        // Check if component is still mounted before updating state
        if (!isMounted) {
          console.log("[AuthContext] Component unmounted, skipping state update");
          return;
        }
        
        if (userData) {
          // User is authenticated, restore user data
          console.log("[AuthContext] User authenticated:", userData);
          setUser(userData)
        } else {
          // User is not authenticated, keep user as null
          console.log("[AuthContext] User not authenticated");
          setUser(null)
        }
      } catch (error) {
        // Error already handled in getCurrentUser, just set user to null
        console.error("[AuthContext] Auth check error:", error);
        if (isMounted) {
          setUser(null)
        }
      } finally {
        // Clear timeout if still active
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Always set loading to false, regardless of mount status
        if (isMounted) {
          console.log("[AuthContext] Setting isLoading to false");
          setIsLoading(false)
        }
      }
    }

    checkAuth()
    
    return () => {
      isMounted = false; // Cleanup: mark as unmounted
      if (timeoutId) {
        clearTimeout(timeoutId); // Clear timeout on unmount
      }
    }
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

