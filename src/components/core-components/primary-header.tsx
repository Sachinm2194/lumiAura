"use client";

import Link from "next/link";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  menuActive: boolean;
  onMenuToggle: () => void;
}

export function PrimaryHeader({ menuActive, onMenuToggle }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // Redirect to home page after logout (home is public)
    router.push("/");
  };

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
          className="mx-auto text-2xl font-extrabold uppercase tracking-widest"
        >
          LumiAura GlowSkin
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
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
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
