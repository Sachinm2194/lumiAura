"use client";

import { useEffect, useState } from "react";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import { ImageCarousel } from "@/components/core-components/imageCarousel";
import Footer from "@/components/core-components/footer";
import IngredientsSection from "@/components/core-components/IngredientsSection";
import { useHeaderIntersection } from "@/hooks/useHeaderIntersection";
import { GetAllProducts } from "./api/auth/products";

export default function Home() {
  const [headerRef, outOfView] = useHeaderIntersection();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    GetAllProducts().then((data) => {
      console.log(data );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {[
              { title: "Matcha Glow Cleanser", img: "/Images/prod1.jpg" },
              { title: "Sakura Blossom Mist", img: "/Images/prod2.jpg" },
              { title: "Rice Water Serum", img: "/Images/carouselImg4.jpg" },
            ].map((product, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg bg-card text-card-foreground"
              >
                <img
                  src={product.img}
                  alt={product.title}
                  className="w-full h-[350px] object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-md transition">
                    Add to Cart
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
        <IngredientsSection />
      </main>

      <Footer />
    </>
  );
}
