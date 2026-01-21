import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';
import ProductCard from './product-card';

export interface WishlistCardProps {
  product: Product;
  className?: string;
  onClick?: (product: Product) => void;
  onWishlistToggle?: (product: Product, isWishlisted: boolean) => void;
  onMoveToCart?: (product: Product) => void;
}

export default function WishlistCard({
  product,
  className,
  onClick,
  onWishlistToggle,
  onMoveToCart,
}: WishlistCardProps) {
  // Handle move to cart
  const handleMoveToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onMoveToCart?.(product);
  };

  return (
    <div className={cn('group relative', className)}>
      {/* Use ProductCard as base */}
      <ProductCard
        product={product}
        initialWishlisted={true}
        onWishlistToggle={onWishlistToggle}
        onClick={onClick}
      />

      {/* Move to Cart Overlay - Shows on hover over image area */}
      <div className="absolute top-0 left-0 right-0 aspect-square bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 pointer-events-none rounded-t-lg">
        <button
          onClick={handleMoveToCartClick}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-md font-semibold hover:bg-primary/90 transition-colors shadow-lg flex items-center gap-2 hover:scale-105 transform duration-200 pointer-events-auto"
          aria-label="Move to cart"
        >
          <ShoppingCart className="w-4 h-4" />
          Move to Cart
        </button>
      </div>
    </div>
  );
}

