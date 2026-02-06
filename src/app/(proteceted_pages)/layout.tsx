"use client"

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import { SearchContext } from "@/contexts/SearchContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchHandler, setSearchHandler] = useState<((query: string) => void) | undefined>();

  // Function to set search handler from child components
  const setSearchHandlerCallback = useCallback((handler: (query: string) => void) => {
    setSearchHandler(() => handler);
  }, []);

  // Clear search handler when navigating to different pages
  useEffect(() => {
    setSearchHandler(undefined);
  }, [pathname]);

  // Redirect only after auth check is complete and user is not authenticated
  useEffect(() => {
    if (hasRedirected.current) return;

    // Wait for loading to complete before making redirect decision
    if (!isLoading && !isAuthenticated) {
      hasRedirected.current = true;
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading spinner while checking auth
  if (isLoading) {
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

  return (
    <SearchContext.Provider value={{ onSearch: searchHandler, setSearchHandler: setSearchHandlerCallback }}>
      <PrimaryHeader
        menuActive={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onSearch={searchHandler}
      />
      <main className="pt-16 w-full px-2 md:px-10">{children}</main>
    </SearchContext.Provider>
  );
}