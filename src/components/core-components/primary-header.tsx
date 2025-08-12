"use client";

import Link from "next/link";
import { Menu, X, Search, ShoppingCart, User } from "lucide-react";

interface Props {
  stickyVisible: boolean;
  menuActive: boolean;
  onMenuToggle: () => void;
}

export function PrimaryHeader({
  stickyVisible,
  menuActive,
  onMenuToggle,
}: Props) {
  const isSticky = stickyVisible;

  return (
    <header
      className={`
        w-full border-b bg-white shadow transition-all duration-300 z-50
        ${isSticky ? "fixed top-0 left-0" : "relative"}
        ${
          isSticky
            ? stickyVisible
              ? "translate-y-0"
              : "-translate-y-full"
            : ""
        }
      `}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        {/* Menu icon only when sticky */}
        {isSticky ? (
          <button
            onClick={onMenuToggle}
            aria-label="Toggle categories"
            className="p-2 rounded hover:bg-gray-100 transition"
          >
            {menuActive ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        ) : (
          <div className="w-6" /> // Keeps layout consistent when not showing icon
        )}

        <Link
          href="/"
          className="mx-auto text-2xl font-extrabold uppercase tracking-widest"
        >
          LumiAura GlowSkin
        </Link>

        <div className="flex gap-4 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="#595959"
            viewBox="0 0 256 256"
            onClick={() => {
              alert("search");
            }}
          >
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="#595959"
            viewBox="0 0 256 256"
          >
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z"></path>
          </svg>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="#595959"
            viewBox="0 0 256 256"
          >
            <path d="M104,216a16,16,0,1,1-16-16A16,16,0,0,1,104,216Zm88-16a16,16,0,1,0,16,16A16,16,0,0,0,192,200ZM239.71,74.14l-25.64,92.28A24.06,24.06,0,0,1,191,184H92.16A24.06,24.06,0,0,1,69,166.42L33.92,40H16a8,8,0,0,1,0-16H40a8,8,0,0,1,7.71,5.86L57.19,64H232a8,8,0,0,1,7.71,10.14ZM221.47,80H61.64l22.81,82.14A8,8,0,0,0,92.16,168H191a8,8,0,0,0,7.71-5.86Z"></path>
          </svg>
        </div>
      </div>
    </header>
  );
}
