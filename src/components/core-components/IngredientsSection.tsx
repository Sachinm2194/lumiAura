"use client";
import { useState } from "react";
import { RotateCw } from "lucide-react";

// Four sample ingredients; update images and descriptions as you need
const INGREDIENTS = [
  {
    name: "Aloe vera",
    img: "/Images/aloe vera.jpg",
    info: "A natural plant extract that hydrates, soothes, and helps repair the skin.",
  },
  {
    name: "Rose Water",
    img: "/Images/rose water.jpg",
    info: "Gently tones, hydrates, and refreshes the skin with a natural floral aroma.",
  },
  {
    name: "Shea Butter",
    img: "/Images/shea butter.jpg",
    info: "Deeply nourishes, softens, and protects skin with rich natural emollients.",
  },
  {
    name: "Vitamin E",
    img: "/Images/vitamin e.avif",
    info: "A powerful antioxidant that helps protect and restore healthy, radiant skin.",
  },
];

export default function IngredientsSection() {
  const [flipped, setFlipped] = useState([false, false, false, false]);

  const handleFlip = (idx: number) => {
    setFlipped((prev) => prev.map((f, i) => (i === idx ? !f : f)));
  };

  return (
    <section className="py-16 bg-background">
      <h2 className="text-3xl font-bold text-center text-foreground mb-10">
        Ingredients Used
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
        {INGREDIENTS.map((ingredient, idx) => (
          <div
            key={ingredient.name}
            className="relative perspective"
            style={{ perspective: 1000 }}
          >
            <div
              className={`w-full h-72 rounded-xl shadow-lg bg-muted transition-transform duration-700 transform-style-preserve-3d ${
                flipped[idx] ? "rotate-y-180" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 overflow-hidden rounded-xl bg-secondary"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <img
                  src={ingredient.img}
                  alt={ingredient.name}
                  className="w-full h-full object-cover rounded-xl"
                  draggable={false}
                />
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
                  {/* Name: highlighted pill style and border */}
                  <span
                    className="bg-card/90 text-primary font-extrabold text-lg py-1 px-3 rounded-lg shadow-lg border-2 border-primary tracking-wide"
                    style={{
                      textShadow: "0 2px 8px rgba(0,0,0,0.18)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {ingredient.name}
                  </span>
                  <button
                    aria-label="Flip card"
                    className="text-card-foreground hover:text-primary p-2 rounded-full bg-foreground/40 transition ml-2"
                    onClick={() => handleFlip(idx)}
                  >
                    <RotateCw className="w-6 h-6 cursor-pointer" />
                  </button>
                </div>
              </div>
              {/* Back Side */}
              <div
                className="absolute inset-0 rounded-xl bg-primary text-primary-foreground text-center text-base px-6 flex items-center justify-center"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* Centered info text */}
                <p className="mx-auto">{ingredient.info}</p>
                {/* Flip icon absolutely bottom right */}
                <button
                  aria-label="Flip card back"
                  className="absolute bottom-4 right-4 text-primary-foreground hover:text-accent-foreground p-2 rounded-full bg-foreground/30 transition"
                  onClick={() => handleFlip(idx)}
                >
                  <RotateCw className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
