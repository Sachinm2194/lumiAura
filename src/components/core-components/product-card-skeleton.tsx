import React from 'react';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
  className?: string;
}

export default function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col bg-card border border-border rounded-lg overflow-hidden shadow-sm md:h-[400px]',
        className
      )}
    >
      {/* Image Container Skeleton */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      </div>

      {/* Product Details Skeleton */}
      <div className="p-2 md:p-3 space-y-1 md:space-y-1.5 flex-1 flex flex-col">
        {/* Brand Skeleton */}
        <div className="h-3 w-16 bg-muted rounded animate-pulse" />

        {/* Product Name Skeleton */}
        <div className="space-y-1">
          <div className="h-3.5 w-full bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-3/4 bg-muted rounded animate-pulse" />
        </div>

        {/* Price Section Skeleton */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mt-1 md:mt-2">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

