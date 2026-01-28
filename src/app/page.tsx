"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import { ImageCarousel } from "@/components/core-components/imageCarousel";
import Footer from "@/components/core-components/footer";
import IngredientsSection from "@/components/core-components/IngredientsSection";
import { useHeaderIntersection } from "@/hooks/useHeaderIntersection";
import { GetAllProducts } from "./api/products";
import { useWishlistContext } from "@/contexts/WishlistContext";
import ProductCard from "@/components/core-components/product-card";
import ProductCardSkeleton from "@/components/core-components/product-card-skeleton";

export default function Home() {
  const router = useRouter();
  const [headerRef, outOfView] = useHeaderIntersection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use the reusable wishlist hook
  const { isWishlisted, toggleWishlist } = useWishlistContext();

  // Fetch products function
  const fetchProducts = async (search?: string) => {
    console.log("=== FETCH PRODUCTS START ===");
    console.log("fetchProducts called with search:", search);
    console.log("Search type:", typeof search);
    console.log("Search is undefined:", search === undefined);
    console.log("Search is empty string:", search === "");
    
    setIsLoading(true);
    try {
      const data = await GetAllProducts(search);
      setProducts(data);
      console.log("Products fetched successfully, count:", data?.length || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
    console.log("=== FETCH PRODUCTS END ===");
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search from header
  const handleSearch = (query: string) => {
    console.log("=== SEARCH FLOW START ===");
    console.log("handleSearch called with query:", `"${query}"`);
    console.log("Query length:", query.length);
    console.log("Query after trim:", `"${query.trim()}"`);
    
    setSearchQuery(query);
    const searchParam = query || undefined;
    console.log("Calling fetchProducts with:", searchParam);
    fetchProducts(searchParam);
    console.log("=== SEARCH FLOW END ===");
  };

  return (
    <>
      <PrimaryHeader
        menuActive={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onSearch={handleSearch}
      />
      <div ref={headerRef} />

      <ImageCarousel />

      <main className="pt-0 w-full px-2 md:px-10">
        <section className="py-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Featured Beauty Products"}
            </h2>
            {searchQuery && (
              <p className="text-muted-foreground mt-2">
                {isLoading ? "Searching..." : `Found ${products.length} product${products.length !== 1 ? 's' : ''}`}
              </p>
            )}
            {searchQuery && (
              <div className="mt-4">
                <button
                  onClick={() => handleSearch("")}
                  className="text-sm text-primary hover:underline"
                >
                  Clear search and show all products
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-10 max-w-7xl mx-auto">
            {isLoading ? (
              // Show 8 skeleton loaders
              Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : products.length > 0 ? (
              products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  initialWishlisted={isWishlisted(product.productId)}
                  onWishlistToggle={toggleWishlist}
                  onClick={(product) => {
                    router.push(`/${product.slug}`);
                  }}
                />
              ))
            ) : (
              // No results state
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground">
                  {searchQuery ? (
                    <>
                      <p className="text-lg mb-2">No products found for "{searchQuery}"</p>
                      <p className="text-sm">Try searching with different keywords</p>
                    </>
                  ) : (
                    <p className="text-lg">No products available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
        <IngredientsSection />
      </main>

      <Footer />
    </>
  );
}
