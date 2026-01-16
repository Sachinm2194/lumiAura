"use client"

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if auth check is complete AND user is not authenticated
    // Don't redirect while loading (wait for auth check to complete)
    if (!isLoading && !isAuthenticated) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show nothing while checking auth or if not authenticated (will redirect)
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
