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
  // Add as many as you have
];


  const autoplay = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
  ]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden" ref={emblaRef}>
      <div className="flex touch-pan-y">
        {images.map((src, index) => (
          <motion.div
            key={index}
            className="min-w-full relative aspect-[16/5.5] flex-shrink-0 overflow-hidden rounded"
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{
              opacity: selectedIndex === index ? 1 : 0.6,
              scale: selectedIndex === index ? 1 : 0.98,
              transition: { duration: 0.6 },
            }}
          >
            
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {index === selectedIndex && (
              <>
            {console.log({src})}

                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-black/40 to-transparent z-10" />
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black/40 to-transparent z-10" />
                </div>
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white z-20"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-black cursor-pointer" />
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white z-20"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 text-black cursor-pointer" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-20">
              {images.map((_, dotIdx) => (
                <motion.span
                  key={dotIdx}
                  className="w-3 h-3 rounded-full border border-white"
                  animate={{
                    backgroundColor:
                      dotIdx === selectedIndex ? "#ffffff" : "rgba(255,255,255,0.4)",
                    scale: dotIdx === selectedIndex ? 1.3 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 200 }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}
