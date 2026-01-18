"use client";

import Link from "next/link";
import {
  Menu,
  X,
  Heart,
  ShoppingCart,
  Settings,
  Package,
  User,
  LogOut,
  CircleUser,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  menuActive: boolean;
  onMenuToggle: () => void;
}

export function PrimaryHeader({ menuActive, onMenuToggle }: Props) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to shrink header and add shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20); // Shrink after 20px scroll
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    const emailParts = user.email.split("@");
    const namePart = emailParts[0];
    if (namePart.length >= 2) {
      return namePart.substring(0, 2).toUpperCase();
    }
    return namePart.charAt(0).toUpperCase();
  };

  // Show skeleton only if loading AND not yet showing buttons
  const shouldShowSkeleton = isLoading && !showButtons;

  return (
    <header
      className={`w-full border-b bg-background fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "h-14 shadow-md backdrop-blur-sm bg-background/95 border-b/50"
          : "h-16 shadow-sm"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-4 px-6 transition-all duration-300 ${
          isScrolled ? "h-14" : "h-16"
        }`}
      >
        {/* <button
          onClick={onMenuToggle}
          aria-label="Toggle categories menu"
          className="p-2 rounded hover:bg-accent transition"
        >
          {menuActive ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button> */}

        <Link
          href="/"
          className={` font-bold uppercase tracking-widest transition-all duration-300 ${
            isScrolled
              ? "text-base md:text-xl"
              : "text-lg md:text-2xl md:font-extrabold"
          }`}
        >
          LumiAura GlowSkin
        </Link>

        <div className="flex items-center gap-2">
          {shouldShowSkeleton ? (
            // Show skeleton loader while checking auth (max 1.5 seconds)
            // Matches authenticated state: Wishlist (icon), Cart (icon), Profile (avatar, hidden on mobile)
            <div className="flex items-center gap-2">
              {/* Wishlist button skeleton - matches Button size="icon" (size-9) */}
              <div className="h-9 w-9 bg-muted rounded-md animate-pulse"></div>
              {/* Cart button skeleton - matches Button size="icon" (size-9) */}
              <div className="h-9 w-9 bg-muted rounded-md animate-pulse"></div>
              {/* Profile avatar skeleton - matches Avatar h-9 w-9 rounded-full, hidden on mobile */}
              <div className="hidden md:block h-9 w-9 bg-muted rounded-full animate-pulse"></div>
            </div>
          ) : isAuthenticated && user ? (
            // Show Wishlist, Cart, and Profile when authenticated
            <div className="flex items-center gap-2">
              {/* Wishlist Button */}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative transition-transform duration-300">
                  <Heart className={`transition-all duration-300 ${isScrolled ? "h-4 w-4" : "h-5 w-5"}`} />
                </Button>
              </Link>

              {/* Cart Button */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative transition-transform duration-300">
                  <ShoppingCart className={`transition-all duration-300 ${isScrolled ? "h-4 w-4" : "h-5 w-5"}`} />
                </Button>
              </Link>

              {/* Profile Popover - Hidden on mobile */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hidden md:flex rounded-full p-0 transition-all duration-300 ${
                      isScrolled ? "h-8 w-8" : "h-9 w-9"
                    }`}
                  >
                    <Avatar className={`transition-all duration-300 ${isScrolled ? "h-8 w-8" : "h-9 w-9"}`}>
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="space-y-1">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b flex items-center gap-2 min-w-0">
                      <CircleUser className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-sm font-semibold truncate flex-1 min-w-0">
                        {user.email}
                      </p>
                    </div>

                    {/* Profile Link */}
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors text-sm"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    {/* Orders Link */}
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors text-sm"
                    >
                      <Package className="h-4 w-4" />
                      Orders
                    </Link>

                    {/* Settings Link */}
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors text-sm"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors text-sm w-full text-left text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
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
                <Button size={isScrolled ? "sm" : "sm"} className="transition-all duration-300">
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
