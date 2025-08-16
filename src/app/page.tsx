"use client";

import { useState } from "react";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import SecondaryHeader from "@/components/core-components/secondary-header";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ImageCarousel } from "@/components/core-components/imageCarousel";
import Footer from "@/components/core-components/footer";
import IngredientsSection from "@/components/core-components/IngredientsSection";
import { useHeaderIntersection } from "@/hooks/useHeaderIntersection";

export default function Home() {
  const [headerRef, outOfView] = useHeaderIntersection();
  const [menuOpen, setMenuOpen] = useState(false);

  const showSticky = outOfView || menuOpen;

  return (
    <>
      <PrimaryHeader
        // stickyVisible={showSticky}
        menuActive={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />

      {/* Secondary header categories menu inside Sheet drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetTitle className="p-0 m-0"/>
          <SecondaryHeader />
        </SheetContent>
      </Sheet>

      <div ref={headerRef} />

      <ImageCarousel />

      <main className="pt-0 w-full px-10">
        <section className="py-16 text-white">
          <h2 className="text-3xl font-bold text-center mb-10">
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
                className="group relative overflow-hidden rounded-xl shadow-lg bg-white text-gray-800"
              >
                <img
                  src={product.img}
                  alt={product.title}
                  className="w-full h-[350px] object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 rounded-md transition">
                    Add to Cart
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
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
