"use client";

import Image from "next/image";
import Link from "next/link";
import { OrderItem } from "@/types/checkout";
import { BuyNowProductData } from "@/types/checkout";

interface OrderSummaryItemProps {
  orderItem: OrderItem;
  productData?: BuyNowProductData | null;
  index?: number;
  isBuyNow?: boolean;
}

export default function OrderSummaryItem({
  orderItem,
  productData,
  index = 0,
  isBuyNow = false,
}: OrderSummaryItemProps) {
  // Get variant details from product data
  const variant = productData?.variants?.find(
    (v) => v.id === orderItem.variantId
  ) || productData?.variants?.[0];

  // Get product image
  const getProductImage = () => {
    if (!productData) return "/Images/placeholder-product.jpg";
    const primaryImage =
      productData.images?.find((img) => img.isPrimary) || productData.images?.[0];
    if (primaryImage?.url) {
      return primaryImage.url;
    }
    return "/Images/placeholder-product.jpg";
  };

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
  if (!productData) {
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
        href={`/${productData.slug}`}
        className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-muted"
      >
        <Image
          src={getProductImage()}
          alt={productData.name}
          width={80}
          height={80}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/Images/placeholder-product.jpg";
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/${productData.slug}`}
          className="block hover:text-primary transition-colors"
        >
          <h4 className="font-semibold text-sm md:text-base text-foreground line-clamp-2 mb-1">
            {productData.name}
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


