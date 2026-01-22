"use client";
import { useEffect, useState } from "react";
import { GetWishlist } from "@/app/api/auth/wishlist";
import WishlistCard from "@/components/core-components/wishlist-card";
import WishlistCardSkeleton from "@/components/core-components/wishlist-card-skeleton";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useWishlistContext } from "@/contexts/WishlistContext";

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
  const router = useRouter();
  const { toggleWishlist, refreshWishlist } = useWishlistContext();

  useEffect(() => {
    const getWishlist = async () => {
      setIsLoading(true);
      try {
        const data = await GetWishlist();
        // Extract products from wishlist items
        // API returns: [{ id, userId, product: {...} }, ...]
        const validWishlistItems = Array.isArray(data) 
          ? data.filter((item: any) => item && item.product && item.product.id)
          : [];
        setWishlistItems(validWishlistItems);
        console.log("Wishlist data:", validWishlistItems);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setWishlistItems([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    getWishlist();
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
        const data = await GetWishlist();
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
      <h1 className="text-3xl font-bold text-center mb-10 text-foreground">
        My Wishlist
      </h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-10 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, index) => (
            <WishlistCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            Your wishlist is empty
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Start adding products to your wishlist!
          </p>
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
