"use client";

import { useEffect, useState, useCallback } from "react";
import { GetWishlist } from "@/app/api/wishlist";
import WishlistCard from "@/components/core-components/wishlist-card";
import WishlistCardSkeleton from "@/components/core-components/wishlist-card-skeleton";
import { Product } from "@/types/product";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { useSearchContext } from "@/contexts/SearchContext";

// Wishlist item structure from API
interface WishlistItem {
  id: number;
  userId: number;
  notes: string | null;
  createdAt: string;
  product: Product;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { toggleWishlist } = useWishlistContext();
  const { setSearchHandler } = useSearchContext();

  // 🔹 Single source of truth for fetching wishlist
  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await GetWishlist(searchQuery || undefined);

      const validWishlistItems = Array.isArray(data)
        ? data.filter((item: any) => item?.product?.id)
        : [];

      setWishlistItems(validWishlistItems);
    } catch {
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // 🔹 React to search query changes (initial load + search)
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // 🔹 Register search handler from layout
  useEffect(() => {
    setSearchHandler((query: string) => {
      setSearchQuery(query);
    });

    return () => setSearchHandler(() => {});
  }, [setSearchHandler]);

  // 🔹 Wishlist toggle (remove / add)
  const handleWishlistToggle = async (product: Product, isWishlisted: boolean) => {
    try {
      await toggleWishlist(product, isWishlisted);
      fetchWishlist();
    } catch {
      // optional: toast error
    }
  };

  // 🔹 Move to cart (future)
  const handleMoveToCart = (product: Product) => {
    // TODO: Implement add to cart API
  };

  // 🔹 Product click (future navigation)
  const handleProductClick = (product: Product) => {
    // TODO: router.push(`/products/${product.slug}`);
  };

  return (
    <div className="w-full px-2 md:px-10 py-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground">
          {searchQuery
            ? `Wishlist Search Results for "${searchQuery}"`
            : "My Wishlist"}
        </h1>

        {searchQuery && (
          <p className="text-muted-foreground mt-2">
            {isLoading
              ? "Searching..."
              : `Found ${wishlistItems.length} item${
                  wishlistItems.length !== 1 ? "s" : ""
                }`}
          </p>
        )}

        {searchQuery && (
          <div className="mt-4">
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-primary hover:underline"
            >
              Clear search and show all wishlist items
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-10 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, index) => (
            <WishlistCardSkeleton key={index} />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {searchQuery ? (
            <>
              <p className="text-lg mb-2">
                No wishlist items found for "{searchQuery}"
              </p>
              <p className="text-sm">Try searching with different keywords</p>
            </>
          ) : (
            <>
              <p className="text-lg">Your wishlist is empty</p>
              <p className="text-sm mt-2">
                Start adding products to your wishlist!
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-10 max-w-7xl mx-auto">
          {wishlistItems.map((item) => (
            <WishlistCard
              key={item.id}
              product={item.product}
              onMoveToCart={handleMoveToCart}
              onWishlistToggle={handleWishlistToggle}
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
