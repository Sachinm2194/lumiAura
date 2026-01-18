"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  isScrolled?: boolean;
  maxWidth?: string;
  showMobileIcon?: boolean; // If true, shows icon on mobile and opens overlay
}

export function SearchBar({
  placeholder = "Search products...",
  onSearch,
  className = "",
  isScrolled = false,
  maxWidth = "w-sm max-w-[400px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[800px]",
  showMobileIcon = false,
}: SearchBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
        if (onSearch) {
          onSearch("");
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSearchOpen, onSearch]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle close search
  const handleClose = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  // Mobile overlay view (when showMobileIcon is true and search is open on mobile)
  const renderMobileOverlay = () => {
    if (!showMobileIcon || !isSearchOpen) return null;

    return (
      <>
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={handleClose}
        />
        {/* Search bar overlay - slides from bottom of header (h-16 = 64px when not scrolled, h-14 = 56px when scrolled) */}
        <div
          className={`fixed left-0 right-0 z-50 bg-background border-b border-border shadow-lg rounded-full md:hidden animate-in slide-in-from-top duration-300 ${
            isScrolled ? "top-14" : "top-16"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 px-4 py-3 ">
            <Search className="text-muted-foreground shrink-0 h-5 w-5" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-0 text-base bg-transparent flex-1 min-w-0 shadow-none"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 shrink-0"
            >
              <CloseIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Desktop inline view (md+ screens) - always shows inline when open
  const renderDesktopSearch = () => {
    if (!isSearchOpen) return null;
    
    return (
      <div
        className={`hidden md:flex items-center gap-2 bg-background border border-border/50 rounded-full px-3 py-1.5 shadow-xs w-full ${maxWidth} transition-all duration-300 ${className}`}
      >
        <Search
          className={`text-muted-foreground shrink-0 ${isScrolled ? "h-4 w-4" : "h-4 w-4"}`}
        />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-0 text-sm bg-transparent flex-1 min-w-0 shadow-none"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-6 w-6 shrink-0"
        >
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Render icon button and conditional overlay/inline search
  return (
    <>
      {/* Mobile overlay - only on mobile when showMobileIcon is true */}
      {renderMobileOverlay()}
      {/* Desktop inline search - only on md+ screens */}
      {renderDesktopSearch()}
      {/* Icon button - visible on mobile always when showMobileIcon, visible on desktop only when search closed */}
      {(!isSearchOpen || showMobileIcon) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(true)}
          className={`relative transition-transform duration-300 ${showMobileIcon && isSearchOpen ? "md:hidden" : ""} ${className}`}
        >
          <Search
            className={`transition-all duration-300 ${isScrolled ? "h-4 w-4" : "h-5 w-5"}`}
          />
        </Button>
      )}
    </>
  );
}

