"use client";

import { useEffect, useState, useCallback } from "react";
import { GetWishlist, AddToWishlist, RemoveFromWishlist } from "@/app/api/wishlist";
import { Product } from "@/types/product";
import { toast } from "react-toastify";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistMap, setWishlistMap] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const syncMapFromItems = (items: any[]) => {
    const set = new Set<string>();
    items.forEach((item: any) => {
      if (item?.product?.productId) set.add(item.product.productId);
    });
    setWishlistMap(set);
  };

  const refreshWishlist = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const wishlistData = await GetWishlist(search);
      if (Array.isArray(wishlistData)) {
        setWishlistItems(wishlistData);
        syncMapFromItems(wishlistData);
      } else {
        setWishlistItems([]);
        setWishlistMap(new Set());
      }
    } catch (error) {
      console.error("Error refreshing wishlist:", error);
      setWishlistItems([]);
      setWishlistMap(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, []);

  const isWishlisted = useCallback((productId: string): boolean => {
    return wishlistMap.has(productId);
  }, [wishlistMap]);

  const toggleWishlist = useCallback(async (product: Product, currentlyWishlisted: boolean) => {
    setIsToggling(true);
    const productId = product.productId;

    try {
      if (currentlyWishlisted) {
        // remove
        await RemoveFromWishlist(productId);
        setWishlistItems((prev) => prev.filter((item: any) => item?.product?.productId !== productId));
        setWishlistMap((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success(`${product.name} removed from wishlist`);
      } else {
        // add then refresh to get server shape
        await AddToWishlist(productId);
        const wishlistData = await GetWishlist();
        if (Array.isArray(wishlistData)) {
          setWishlistItems(wishlistData);
          syncMapFromItems(wishlistData);
        }
        toast.success(`${product.name} added to wishlist`);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      throw error;
    } finally {
      setIsToggling(false);
    }
  }, []);

  return {
    wishlistItems,
    wishlistMap,
    isLoading,
    isToggling,
    isWishlisted,
    toggleWishlist,
    refreshWishlist,
  };
}

