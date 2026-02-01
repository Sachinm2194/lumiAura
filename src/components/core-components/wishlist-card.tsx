"use client";

import React, { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';
import { Button } from '../ui/button';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useCartContext } from '@/contexts/CartContext';

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
  // Get wishlist state from context
  const { isWishlisted: isProductWishlisted } = useWishlistContext();
  const { refreshCart } = useCartContext();
  
  const [imageUrl, setImageUrl] = useState(() => {
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    if (primaryImage?.url) return primaryImage.url;
    if (product.slug) return `/Images/${product.slug}.PNG`;
    return '/Images/placeholder-product.jpg';
  });

  const isWishlisted = isProductWishlisted(product.productId);
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
  const currentPrice = defaultVariant ? parseFloat(defaultVariant.sellingPrice || '0') : 0;
  const originalPrice = defaultVariant ? parseFloat(defaultVariant.mrp || '0') : 0;
  const rating = parseFloat(product.averageRating || '0');
  const reviewCount = product.reviewCount || 0;
  const brand = product.category?.name || 'LUMIAURA';
  const calculatedDiscount = originalPrice && currentPrice && originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle?.(product, isWishlisted);
  };

  const handleMoveToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Call the parent's handler to add to cart
    onMoveToCart?.(product);
    // Refresh cart to get accurate count from server
    refreshCart();
  };

  const handleImageError = () => {
    if (product.slug && imageUrl.includes(product.slug)) {
      const lowerCaseUrl = `/Images/${product.slug.toLowerCase()}.PNG`;
      if (imageUrl !== lowerCaseUrl) {
        setImageUrl(lowerCaseUrl);
        return;
      }
    }
    setImageUrl('/Images/placeholder-product.jpg');
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-IN')}`;
  };

  const formatReviewCount = (count: number | string) => {
    if (typeof count === 'string') return count;
    if (count >= 1000) {
      const k = (count / 1000).toFixed(1);
      return k.endsWith('.0') ? `${k.replace('.0', '')}k` : `${k}k`;
    }
    return count.toString();
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer md:h-[380px]',
        className
      )}
      onClick={() => onClick?.(product)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />

        {/* Wishlist Icon - Top Right (use to remove from wishlist) */}
        <Button
          onClick={handleWishlistClick}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110 z-10 p-0"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-all duration-200',
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'fill-transparent text-gray-700 hover:text-red-500'
            )}
          />
        </Button>

        {/* Rating Overlay */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{rating}</span>
          <span className="text-white/80">({formatReviewCount(reviewCount)})</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2 md:p-3 space-y-1 md:space-y-1.5 flex-1 flex flex-col">
        {/* Brand */}
        <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {brand}
        </p>

        {/* Product Name */}
        <h3 className="text-xs md:text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mt-1 md:mt-2">
          {/* Current Price */}
          <span className="text-sm md:text-base font-bold text-foreground">
            {formatPrice(currentPrice)}
          </span>

          {/* Original Price (if exists) */}
          {originalPrice && originalPrice > currentPrice && (
            <>
              <span className="text-xs md:text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
              {/* Discount */}
              {calculatedDiscount && (
                <span className="text-[10px] md:text-xs font-semibold text-primary">
                  ({calculatedDiscount}% OFF)
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Move to Cart Button at Bottom */}
      <button
        onClick={handleMoveToCartClick}
        className="w-full cursor-pointer bg-primary text-primary-foreground px-3 py-2 font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 border-t border-border"
        aria-label="Move to cart"
      >
        <ShoppingCart className="w-4 h-4" />
        Move to Cart
      </button>
    </div>
  );
}

