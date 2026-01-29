"use client";
import { useEffect, useState } from "react";
import { GetWishlist } from "@/app/api/wishlist";
import WishlistCard from "@/components/core-components/wishlist-card";
import WishlistCardSkeleton from "@/components/core-components/wishlist-card-skeleton";
import { Product } from "@/types/product";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { useSearchContext } from "../layout";

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

  // Fetch wishlist function
  const fetchWishlist = async (search?: string) => {
    console.log("=== FETCH WISHLIST START ===");
    console.log("fetchWishlist called with search:", search);
    console.log("Search type:", typeof search);
    console.log("Search is undefined:", search === undefined);
    console.log("Search is empty string:", search === "");
    
    setIsLoading(true);
    try {
      const data = await GetWishlist(search);
      // Extract products from wishlist items
      // API returns: [{ id, userId, product: {...} }, ...]
      const validWishlistItems = Array.isArray(data) 
        ? data.filter((item: any) => item && item.product && item.product.id)
        : [];
      setWishlistItems(validWishlistItems);
      console.log("Wishlist data fetched successfully, count:", validWishlistItems.length);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
    console.log("=== FETCH WISHLIST END ===");
  };

  // Handle search from header
  const handleSearch = (query: string) => {
    console.log("=== WISHLIST SEARCH FLOW START ===");
    console.log("handleSearch called with query:", `"${query}"`);
    console.log("Query length:", query.length);
    console.log("Query after trim:", `"${query.trim()}"`);
    
    setSearchQuery(query);
    const searchParam = query || undefined;
    console.log("Calling fetchWishlist with:", searchParam);
    fetchWishlist(searchParam);
    console.log("=== WISHLIST SEARCH FLOW END ===");
  };

  // Set search handler in layout on mount
  useEffect(() => {
    setSearchHandler(handleSearch);
    // Cleanup: remove search handler when component unmounts
    return () => setSearchHandler(() => {});
  }, [setSearchHandler]);

  // Initial fetch on mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  // Handle move to cart
  const handleMoveToCart = (product: Product) => {
    console.log("Move to cart:", product);
    // TODO: Implement add to cart API call
    // After adding to cart, you might want to remove from wishlist or show a success message
  };

  // Handle wishlist toggle (remove from wishlist)
  const handleWishlistToggle = async (product: Product, isWishlisted: boolean) => {
    try {
      // Use the context's toggleWishlist which handles API calls and updates global state
      await toggleWishlist(product, isWishlisted);
      
      // Update local state to reflect the change
      if (!isWishlisted) {
        // Remove from local state
        setWishlistItems((prev) => 
          prev.filter((item) => item.product.productId !== product.productId)
        );
      } else {
        // Refresh wishlist to get updated data if item was added back
        const data = await GetWishlist(searchQuery || undefined);
        const validWishlistItems = Array.isArray(data) 
          ? data.filter((item: any) => item && item.product && item.product.id)
          : [];
        setWishlistItems(validWishlistItems);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  // Handle product click (navigate to product details)
  const handleProductClick = (product: Product) => {
    // TODO: Navigate to product details page
    console.log("Product clicked:", product);
    // router.push(`/products/${product.slug}`);
  };

  return (
    <div className="w-full px-2 md:px-10 py-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground">
          {searchQuery ? `Wishlist Search Results for "${searchQuery}"` : "My Wishlist"}
        </h1>
        {searchQuery && (
          <p className="text-muted-foreground mt-2">
            {isLoading ? "Searching..." : `Found ${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''}`}
          </p>
        )}
        {searchQuery && (
          <div className="mt-4">
            <button
              onClick={() => handleSearch("")}
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
            <WishlistCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          {searchQuery ? (
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">No wishlist items found for "{searchQuery}"</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <p className="text-lg">Your wishlist is empty</p>
              <p className="text-sm mt-2">Start adding products to your wishlist!</p>
            </div>
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
