"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";

interface Props {
  menuActive: boolean;
  onMenuToggle: () => void;
}

export function PrimaryHeader({ menuActive, onMenuToggle }: Props) {
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

        <div className="w-6" /> {/* Placeholder for layout balance */}
      </div>
    </header>
  );
}
