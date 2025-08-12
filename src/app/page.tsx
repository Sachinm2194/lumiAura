"use client";

import { useState } from "react";
import { useHeaderIntersection } from "@/hooks/useHeaderIntersection";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import SecondaryHeader from "@/components/core-components/secondary-header";
import { ImageCarousel } from "@/components/core-components/imageCarousel";
import Footer from "@/components/core-components/footer";
import IngredientsSection from "@/components/core-components/IngredientsSection";

export default function Home() {
  const [headerRef, outOfView] = useHeaderIntersection();

  const [showOverlay, setShowOverlay] = useState(false);

  // Show sticky header when main header scrolls out or menu overlay opened

  const showSticky = outOfView || showOverlay;

  return (
    <>
      <PrimaryHeader
        stickyVisible={showSticky}
        menuActive={showOverlay}
        onMenuToggle={() => setShowOverlay((v) => !v)}
      />

      {/* Original secondary header, part of document flow */}

      <div ref={headerRef}>
        <SecondaryHeader show={true} overlay={false} />
      </div>

      {/* Sticky version of secondary header (toggleable via menu button) */}

      <SecondaryHeader show={showOverlay} overlay={true} />
      <ImageCarousel />

      <main className="pt-0 w-full px-10">
        <section className="py-16  text-white">
          <h2 className="text-3xl font-bold text-center mb-10">
            Featured Beauty Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {[
              {
                title: "Matcha Glow Cleanser",
                img: "/Images/prod1.jpg",
              },
              {
                title: "Sakura Blossom Mist",
                img: "/Images/prod2.jpg",
              },
              {
                title: "Rice Water Serum",
                img: "/Images/carouselImg4.jpg",
              },
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

                {/* Hover Add to Cart button */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 rounded-md transition">
                    Add to Cart
                  </button>
                </div>

                {/* Product title */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <IngredientsSection/>
      </main>
      <Footer />
    </>
  );
}
