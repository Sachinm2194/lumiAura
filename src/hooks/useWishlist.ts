"use client";

import { useEffect, useState, useCallback } from "react";
import { GetWishlist, AddToWishlist, RemoveFromWishlist } from "@/app/api/auth/wishlist";
import { Product } from "@/types/product";
import { toast } from "react-toastify";

/**
 * Custom hook for managing wishlist functionality
 * Can be used across all pages (homepage, category pages, product detail pages, etc.)
 * 
 * @returns {Object} Wishlist state and functions
 */
export function useWishlist() {
  // Track wishlist state: Set of productIds (UUID strings)
  const [wishlistMap, setWishlistMap] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Fetch wishlist to get initial state
  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const wishlistData = await GetWishlist();
        if (Array.isArray(wishlistData)) {
          // Create a set of productIds (UUID strings)
          const set = new Set<string>();
          wishlistData.forEach((item: any) => {
            // Use product.productId (UUID string)
            if (item?.product?.productId) {
              set.add(item.product.productId);
            }
          });
          setWishlistMap(set);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  // Check if a product is wishlisted
  const isWishlisted = useCallback((productId: string): boolean => {
    return wishlistMap.has(productId);
  }, [wishlistMap]);

  // Toggle wishlist (add or remove)
  const toggleWishlist = useCallback(async (product: Product, isWishlisted: boolean) => {
    setIsToggling(true);
    const productId = product.productId; // Use UUID string

    try {
      if (isWishlisted) {
        // Add to wishlist
        await AddToWishlist(productId);
        setWishlistMap((prev) => new Set(prev).add(productId));
        toast.success(`${product.name} added to wishlist`);
      } else {
        // Remove from wishlist using productId (UUID)
        await RemoveFromWishlist(productId);
        setWishlistMap((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success(`${product.name} removed from wishlist`);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist. Please try again.");
      // Re-throw error so components can handle it if needed
      throw error;
    } finally {
      setIsToggling(false);
    }
  }, [wishlistMap]);

  // Refresh wishlist (useful after external changes)
  const refreshWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const wishlistData = await GetWishlist();
      if (Array.isArray(wishlistData)) {
        const set = new Set<string>();
        wishlistData.forEach((item: any) => {
          if (item?.product?.productId) {
            set.add(item.product.productId);
          }
        });
        setWishlistMap(set);
      }
    } catch (error) {
      console.error("Error refreshing wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    wishlistMap,
    isLoading,
    isToggling,
    isWishlisted,
    toggleWishlist,
    refreshWishlist,
  };
}

