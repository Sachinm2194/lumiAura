"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllCategories } from "@/app/api/category";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useSearchContext } from "@/contexts/SearchContext";

interface Category {
  id: number;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { setSearchHandler } = useSearchContext();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Fetch categories with optional search
  const fetchCategories = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await getAllCategories(search);

      const activeCategories = Array.isArray(data)
        ? data.filter((cat: Category) => cat.status === "active")
        : [];

      setCategories(activeCategories);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔹 Initial fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Handle search from header (submit/enter or icon click)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    fetchCategories(query || undefined);
  }, [fetchCategories]);

  // 🔹 Register search handler with header
  useEffect(() => {
    setSearchHandler(handleSearch);
    return () => setSearchHandler(() => {});
  }, [handleSearch]);

  const handleCategoryClick = (slug: string) => {
    router.push(`/category/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Categories
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <CardContent className="p-3 md:p-4">
                  <div className="h-5 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            All Categories
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Explore our wide range of beauty products
          </p>
        </div>

        {/* Search Result Info */}
        {searchQuery && !isLoading && (
          <p className="text-sm text-muted-foreground mb-6">
            Found {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </p>
        )}

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group border hover:border-primary/50"
                onClick={() => handleCategoryClick(category.slug)}
              >
                {/* Category Image/Icon */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 via-primary/5 to-muted overflow-hidden group-hover:from-primary/20 group-hover:via-primary/10 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold text-primary/30 group-hover:text-primary/40 transition-colors select-none">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted-foreground text-base md:text-lg">
              {searchQuery
                ? `No categories found for "${searchQuery}".`
                : "No categories available at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
