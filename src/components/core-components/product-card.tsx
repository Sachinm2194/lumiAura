import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product, ProductCardProps } from '@/types/product';
import { Button } from '../ui/button';

export default function ProductCard({ 
  product, 
  className, 
  onClick, 
  isAd = false,
  onWishlistToggle,
  initialWishlisted = false
}: ProductCardProps) {
  // Get default variant (or first variant if no default)
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
  
  // Get image URL - prioritize backend images, fallback to slug-based local image
  const getImageUrl = () => {
    // First, check if backend provides images
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    if (primaryImage?.url) {
      return primaryImage.url;
    }
    
    // If no backend image, use slug to map to local image
    if (product.slug) {
      // Construct path: /Images/{slug}.PNG
      return `/Images/${product.slug}.PNG`;
    }
    
    // Final fallback
    return '/Images/placeholder-product.jpg';
  };
  
  const [imageUrl, setImageUrl] = useState(getImageUrl());
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  
  // Sync with prop changes (e.g., when wishlist is updated from parent)
  React.useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);
  
  // Handle wishlist toggle
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const newWishlistState = !isWishlisted;
    setIsWishlisted(newWishlistState);
    onWishlistToggle?.(product, newWishlistState);
  };
  
  const handleImageError = () => {
    // If slug-based image fails, try lowercase or use placeholder
    if (product.slug && imageUrl.includes(product.slug)) {
      const lowerCaseUrl = `/Images/${product.slug.toLowerCase()}.PNG`;
      if (imageUrl !== lowerCaseUrl) {
        setImageUrl(lowerCaseUrl);
        return;
      }
    }
    setImageUrl('/Images/placeholder-product.jpg');
  };
  
  // Parse prices from strings (with fallback if no variant)
  const currentPrice = defaultVariant ? parseFloat(defaultVariant.sellingPrice || '0') : 0;
  const originalPrice = defaultVariant ? parseFloat(defaultVariant.mrp || '0') : 0;
  
  // Parse rating
  const rating = parseFloat(product.averageRating || '0');
  const reviewCount = product.reviewCount || 0;
  
  // Get brand from category or use a default
  const brand = product.category?.name || 'LUMIAURA';

  // Format price to Indian Rupee format
  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-IN')}`;
  };

  // Format review count (e.g., 12500 -> "12.5k", 1100 -> "1.1k")
  const formatReviewCount = (count: number | string) => {
    if (typeof count === 'string') return count;
    if (count >= 1000) {
      const k = (count / 1000).toFixed(1);
      return k.endsWith('.0') ? `${k.replace('.0', '')}k` : `${k}k`;
    }
    return count.toString();
  };

  // Calculate discount percentage
  const calculatedDiscount = originalPrice && currentPrice && originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

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

        {/* Wishlist Icon - Top Right */}
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

        {/* AD Badge - Top Left (moved to avoid conflict with wishlist) */}
        {isAd && (
          <div className="absolute top-2 left-2 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded z-10">
            AD
          </div>
        )}

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
    </div>
  );
}
