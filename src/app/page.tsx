"use client";

import { useEffect, useState } from "react";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import { ImageCarousel } from "@/components/core-components/imageCarousel";
import Footer from "@/components/core-components/footer";
import IngredientsSection from "@/components/core-components/IngredientsSection";
import { useHeaderIntersection } from "@/hooks/useHeaderIntersection";
import { GetAllProducts } from "./api/auth/products";
import ProductCard from "@/components/core-components/product-card";
import ProductCardSkeleton from "@/components/core-components/product-card-skeleton";

export default function Home() {
  const [headerRef, outOfView] = useHeaderIntersection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAllProducts = async () => {
      setIsLoading(true);
      try {
        const data = await GetAllProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getAllProducts();
  }, []);

  return (
    <>
      <PrimaryHeader
        menuActive={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />
      <div ref={headerRef} />

      <ImageCarousel />

      <main className="pt-0 w-full px-2 md:px-10">
        <section className="py-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
            Featured Beauty Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-10 max-w-7xl mx-auto">
            {isLoading ? (
              // Show 8 skeleton loaders
              Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : (
              products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>
        <IngredientsSection />
      </main>

      <Footer />
    </>
  );
}
