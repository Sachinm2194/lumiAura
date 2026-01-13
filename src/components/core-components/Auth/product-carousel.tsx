"use client"

import { useState, useEffect } from "react"

interface Product {
  id: number
  name: string
  category: string
  gradient: string
  icon: string
}

const products: Product[] = [
  {
    id: 1,
    name: "Hydrating Moisturizer",
    category: "Daily Care",
    gradient: "from-blue-400 via-cyan-300 to-teal-400",
    icon: "💧",
  },
  {
    id: 2,
    name: "Vitamin C Serum",
    category: "Treatment",
    gradient: "from-yellow-300 via-orange-300 to-amber-400",
    icon: "✨",
  },
  {
    id: 3,
    name: "Night Repair Mask",
    category: "Recovery",
    gradient: "from-purple-400 via-pink-300 to-rose-400",
    icon: "🌙",
  },
  {
    id: 4,
    name: "SPF Sunscreen",
    category: "Protection",
    gradient: "from-orange-400 via-red-300 to-pink-400",
    icon: "☀️",
  },
  {
    id: 5,
    name: "Aloe Vera Gel",
    category: "Soothing",
    gradient: "from-green-400 via-emerald-300 to-teal-400",
    icon: "🌿",
  },
]

export default function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<"next" | "prev">("next")

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection("next")
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handlePrev = () => {
    setDirection("prev")
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const handleNext = () => {
    setDirection("next")
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  const getVisibleProducts = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      visible.push(products[(currentIndex + i) % products.length])
    }
    return visible
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Main Product Display */}
      <div className="relative h-80 flex items-center justify-center perspective">
        <div className="absolute inset-0 flex items-center justify-center">
          {getVisibleProducts().map((product, idx) => (
            <div
              key={product.id}
              className={`absolute w-44 h-56 rounded-2xl bg-gradient-to-br ${product.gradient} shadow-2xl border-2 border-white/40 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-700 transform hover:shadow-2xl hover:scale-105`}
              style={{
                transform:
                  idx === 0
                    ? "translateX(0) scale(1) rotateY(0deg) translateZ(0)"
                    : idx === 1
                      ? "translateX(140px) scale(0.75) rotateY(-25deg) opacity-50"
                      : "translateX(-140px) scale(0.75) rotateY(25deg) opacity-30",
                zIndex: 3 - idx,
                transitionDelay: `${idx * 100}ms`,
              }}
            >
              <div className="text-7xl mb-4 animate-rotate-pulse">{product.icon}</div>
              <h3 className="text-center font-bold text-foreground text-base drop-shadow-sm">{product.name}</h3>
              <p className="text-xs text-foreground/70 mt-2 drop-shadow-sm">{product.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between px-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <button
          onClick={handlePrev}
          className="p-2 cursor-pointer rounded-full hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
          aria-label="Previous product"
        >
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="flex justify-center gap-2">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? "next" : "prev")
                setCurrentIndex(idx)
              }}
              className={`transition-all duration-500 rounded-full transform hover:scale-110 ${
                idx === currentIndex
                  ? "w-8 h-3 bg-gradient-to-r from-primary to-accent shadow-lg"
                  : "w-2 h-2 bg-border hover:bg-muted-foreground"
              }`}
              aria-label={`Go to product ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2 cursor-pointer rounded-full hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
          aria-label="Next product"
        >
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div
        className="text-center space-y-2 p-5 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md rounded-xl border border-primary/20 animate-fade-in"
        style={{ animationDelay: "0.4s" }}
      >
        <p className="text-sm font-bold text-foreground">{products[currentIndex].name}</p>
        <p className="text-xs text-muted-foreground">{products[currentIndex].category}</p>
      </div>
    </div>
  )
}
