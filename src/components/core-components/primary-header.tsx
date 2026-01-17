"use client";

import Link from "next/link";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  menuActive: boolean;
  onMenuToggle: () => void;
}

export function PrimaryHeader({ menuActive, onMenuToggle }: Props) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);

  // Optimistic rendering: Show buttons after max 1.5 seconds, even if still loading
  // This prevents the header from being stuck in loading state
  useEffect(() => {
    if (!isLoading) {
      setShowButtons(true);
      return;
    }

    // If still loading after 1.5 seconds, show buttons optimistically
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleLogout = async () => {
    await logout();
    // Redirect to home page after logout (home is public)
    router.push("/");
  };

  // Show skeleton only if loading AND not yet showing buttons
  const shouldShowSkeleton = isLoading && !showButtons;

  return (
    <header className="w-full border-b bg-white shadow fixed top-0 left-0 z-50">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle categories menu"
          className="p-2 rounded hover:bg-gray-100 transition"
        >
          {menuActive ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        <Link
          href="/"
          className="mx-auto text-lg md:text-2xl font:bold  md:font-extrabold uppercase tracking-widest"
        >
          LumiAura GlowSkin
        </Link>

        <div className="flex items-center gap-2">
          {shouldShowSkeleton ? (
            // Show skeleton loader while checking auth (max 1.5 seconds)
            // Matches the unauthenticated button layout: Sign Up (hidden on mobile) + Sign In
            <div className="flex items-center gap-2">
              {/* Sign Up button skeleton - hidden on mobile */}
              <div className="hidden md:block h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
              {/* Sign In button skeleton - always visible */}
              <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          ) : isAuthenticated && user ? (
            // Show user info and logout when authenticated
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700 font-medium">{user.email}</span>
                {user.role && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {user.role}
                  </span>
                )}
              </div>
              <Link href="/cart">
                <Button variant="outline" size="sm">
                  Cart
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            // Show login/signup links when not authenticated
            <div className="flex items-center gap-2">
              <Link href="/sign-up" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  Sign Up
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
