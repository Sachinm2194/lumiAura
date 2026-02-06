"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { OrderItem } from "@/types/checkout";
import { BuyNowProductData } from "@/types/checkout";

interface OrderSummaryItemProps {
  orderItem: OrderItem;
  productData?: BuyNowProductData | null;
  cartProductData?: Record<string, BuyNowProductData>;
  index?: number;
  isBuyNow?: boolean;
}

export default function OrderSummaryItem({
  orderItem,
  productData,
  cartProductData,
  index = 0,
  isBuyNow = false,
}: OrderSummaryItemProps) {
  // Get product data - use productData for Buy Now, or lookup from cartProductData for cart flow
  const actualProductData = isBuyNow 
    ? productData 
    : (cartProductData?.[orderItem.productId] || productData);

  // Get variant details from product data
  const variant = actualProductData?.variants?.find(
    (v) => Number(v.id) === Number(orderItem.variantId)
  ) || actualProductData?.variants?.[0];

  // Get product image URL using slug pattern: /Images/{slug}.PNG
  const getProductImageUrl = () => {
    if (!actualProductData?.slug) return null;
    return `/Images/${actualProductData.slug}.PNG`;
  };

  const productImageUrl = getProductImageUrl();
  const [imageError, setImageError] = useState(false);

  // Calculate price
  const price = variant ? parseFloat(variant.sellingPrice || "0") : 0;
  const totalPrice = price * orderItem.quantity;

  // Get variant name from productVariant or variant
  const variantName =
    orderItem.productVariant?.size ||
    orderItem.productVariant?.color ||
    variant?.variantName ||
    "";

  // If no product data, show minimal info
  if (!actualProductData) {
    return (
      <div className="flex gap-3 py-3 border-b border-border last:border-0">
        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No Image</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm md:text-base text-foreground mb-1">
            {isBuyNow ? "Item" : `Item ${index + 1}`}
          </h4>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Qty: {orderItem.quantity}
            </span>
            <span className="text-sm md:text-base font-semibold text-primary">
              Price not available
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      {/* Product Image */}
      <Link
        href={`/${actualProductData.slug}`}
        className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-muted flex items-center justify-center"
      >
        {productImageUrl && !imageError ? (
          <Image
            src={productImageUrl}
            alt={actualProductData.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-xs text-muted-foreground">No Image</span>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/${actualProductData.slug}`}
          className="block hover:text-primary transition-colors"
        >
          <h4 className="font-semibold text-sm md:text-base text-foreground line-clamp-2 mb-1">
            {actualProductData.name}
          </h4>
        </Link>

        {variantName && (
          <p className="text-xs text-muted-foreground mb-1">
            Variant: {variantName}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            Qty: {orderItem.quantity}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm md:text-base font-semibold text-primary">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
            {variant?.mrp && parseFloat(variant.mrp) > price && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{parseFloat(variant.mrp).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


