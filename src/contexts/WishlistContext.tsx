"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useWishlist } from "@/hooks/useWishlist";

// Wishlist context type
interface WishlistContextType {
  wishlistMap: Set<string>;
  isLoading: boolean;
  isToggling: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: any, isWishlisted: boolean) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

// Create context with undefined default
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Wishlist Provider component
export function WishlistProvider({ children }: { children: ReactNode }) {
  const wishlistData = useWishlist();

  return (
    <WishlistContext.Provider value={wishlistData}>
      {children}
    </WishlistContext.Provider>
  );
}

// Custom hook to use wishlist context
export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlistContext must be used within a WishlistProvider");
  }
  return context;
}

