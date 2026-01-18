"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function ImageCarousel() {
  const images = [
    "/Images/LumiAura-GlowSkin.png",
    "/Images/carouselImg1.jpg",
    "/Images/carouselImg2.jpg",
    "/Images/carouselImg4.jpg",
  ];

  const autoplay = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "center",
      slidesToScroll: 1,
    },
    [autoplay.current]
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    // Pause autoplay on hover
    if (isHovered) {
      autoplay.current?.stop();
    } else {
      autoplay.current?.play();
    }
  }, [emblaApi, isHovered]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div
      className="relative w-full overflow-hidden group"
      ref={emblaRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex touch-pan-y">
        {images.map((src, index) => (
          <div
            key={index}
            className="min-w-full relative flex-shrink-0 overflow-hidden"
          >
            {/* Consistent height: Mobile h-[280px], Desktop h-[450px] - all images same height */}
            <div className="relative h-[280px] md:h-[450px] w-full">
              <img
                src={src}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading={index === 0 ? "eager" : "lazy"}
              />

              {/* Gradient overlay for better text/button visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons - always visible, positioned outside slides */}
      <button
        onClick={scrollPrev}
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-md rounded-full p-2.5 md:p-3 shadow-lg hover:bg-background z-30 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-md rounded-full p-2.5 md:p-3 shadow-lg hover:bg-background z-30 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
      </button>

      {/* Dot indicators - positioned outside slides */}
      <div className="absolute bottom-3 md:bottom-6 left-0 right-0 flex justify-center items-center gap-2 z-30">
        {images.map((_, dotIdx) => (
          <button
            key={dotIdx}
            onClick={() => emblaApi?.scrollTo(dotIdx)}
            className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all duration-300 p-1"
            aria-label={`Go to slide ${dotIdx + 1}`}
          >
            <motion.span
              className="block rounded-full transition-all duration-300"
              animate={{
                backgroundColor:
                  dotIdx === selectedIndex ? "#F8981D" : "rgba(255, 255, 255, 0.6)",
                scale: dotIdx === selectedIndex ? 1.15 : 1,
              }}
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                width: "8px",
                height: "8px",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
