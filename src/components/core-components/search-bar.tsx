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
}

export function SearchBar({
  placeholder = "Search products...",
  onSearch,
  className = "",
  isScrolled = false,
  maxWidth = "w-sm max-w-[400px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[800px]",
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

  if (isSearchOpen) {
    return (
      <div
        className={`flex items-center gap-2 bg-background border border-border/50 rounded-full px-3 py-1.5 shadow-xs w-full ${maxWidth} transition-all duration-300 ${className}`}
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
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsSearchOpen(true)}
      className={`relative transition-transform duration-300 ${className}`}
    >
      <Search
        className={`transition-all duration-300 ${isScrolled ? "h-4 w-4" : "h-5 w-5"}`}
      />
    </Button>
  );
}

