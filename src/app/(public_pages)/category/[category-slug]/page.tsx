"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCategoryBySlug } from "@/app/api/category";
import { Product } from "@/types/product";
import { useWishlistContext } from "@/contexts/WishlistContext";
import ProductCard from "@/components/core-components/product-card";
import ProductCardSkeleton from "@/components/core-components/product-card-skeleton";
import Breadcrumbs from "@/components/core-components/breadcrumbs";

interface Category {
  id: number;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
}

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.["category-slug"] as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isWishlisted, toggleWishlist } = useWishlistContext();

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return;

      setIsLoading(true);
      try {
        // Fetch category with products using the API
        const data = await getCategoryBySlug(categorySlug);
        
        if (data) {
          // Set category info
          setCategory({
            id: data.id,
            categoryId: data.categoryId,
            name: data.name,
            slug: data.slug,
            description: data.description,
          });

          // Set products (assuming API returns products array or products field)
          const categoryProducts = data.products || data.productsList || [];
          setProducts(Array.isArray(categoryProducts) ? categoryProducts : []);
        }
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="mb-4 md:mb-6">
            <div className="h-8 bg-muted animate-pulse rounded w-1/3 mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <button
            onClick={() => router.push("/categories")}
            className="text-primary hover:underline"
          >
            Go to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto pt-3 md:pt-4">
        <Breadcrumbs
          items={[
            { label: "Categories", href: "/categories" },
            { label: category.name },
          ]}
          showBackButton={true}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {/* Category Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm md:text-base text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onWishlistToggle={toggleWishlist}
                onClick={(product) => {
                  router.push(`/category/${categorySlug}/${product.slug}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted-foreground text-base md:text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

