"use client"

import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  // Redirect immediately when we know user is not authenticated
  // Redirect if: (loading completed AND not authenticated) OR (short delay passed AND not authenticated)
  useEffect(() => {
    if (hasRedirected.current) return;

    if (!isAuthenticated) {
      // If loading completed, redirect immediately
      if (!isLoading) {
        hasRedirected.current = true;
        router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // If still loading, wait max 500ms then redirect (quick response for unauthenticated users)
      const timer = setTimeout(() => {
        if (!isAuthenticated && !hasRedirected.current) {
          hasRedirected.current = true;
          router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading spinner while checking auth (only if user might be authenticated)
  if (isLoading && (isAuthenticated || !hasRedirected.current)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}