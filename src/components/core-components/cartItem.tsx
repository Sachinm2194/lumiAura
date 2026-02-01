"use client";

import React, { useState } from "react";
import { Trash2, Heart, Minus, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useWishlistContext } from "@/contexts/WishlistContext";

interface CartItemProps {
  item: any;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onRemove: (id: number) => void;
  onMoveToWishlist: (product: any) => void;
  onQuantityChange?: (id: number, quantity: number) => void;
  onVariantChange?: (id: number, variantId: string | number) => void;
}

export default function CartItem({
  item,
  isSelected,
  onSelect,
  onRemove,
  onMoveToWishlist,
  onQuantityChange,
  onVariantChange,
}: CartItemProps) {
  const { isWishlisted, toggleWishlist } = useWishlistContext();
  const isInWishlist = isWishlisted(item.product.productId);
  const [quantity, setQuantity] = useState(item.quantity || 1);

  console.log("CartItem Rendered:", item);
  // Determine default variant (prefer server-provided default, fallback to first)
  const defaultVariant =
    item.product?.variants?.find((v: any) => v.isDefault) ||
    item.product?.variants?.[0];

  // Support variants that use `variantId` or `id` fields in API
  const initialVariantId =
    item.variant?.variantId ||
    item.variant?.id ||
    defaultVariant?.variantId ||
    defaultVariant?.id;

  const [selectedVariantId, setSelectedVariantId] = useState<number | string | undefined>(
    initialVariantId
  );

  const selectedVariant =
    item.product?.variants?.find(
      (v: any) =>
        v.variantId === selectedVariantId ||
        v.id === selectedVariantId
    ) || defaultVariant;

  const handleWishlistToggle = async () => {
    try {
      await toggleWishlist(item.product, isInWishlist);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      onQuantityChange?.(item.id, newQuantity);
    }
  };

  const handleVariantChange = (variantId: string | number) => {
    const numVariantId = typeof variantId === "string" ? parseInt(variantId, 10) : variantId;
    setSelectedVariantId(numVariantId);
    onVariantChange?.(item.id, numVariantId);
  };

  // use selected variant for pricing
  const price = parseFloat(selectedVariant?.sellingPrice || "0");
  const totalPrice = price * quantity;

  // Get product image
  const getProductImage = () => {
    const primaryImage =
      item.product.images?.find((img: any) => img.isPrimary) ||
      item.product.images?.[0];
    if (primaryImage?.url) {
      return primaryImage.url;
    }
    return `/Images/${item.product.slug}.PNG`;
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* 🔹 Checkbox and Action Bar (Top) */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(item.id, checked as boolean)}
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <button
            onClick={handleWishlistToggle}
            className={`flex items-center gap-1 hover:opacity-70 transition-opacity ${
              isInWishlist ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} />
            <span className="hidden sm:inline">
              {isInWishlist ? "Wishlist" : "Add"}
            </span>
          </button>

          <span className="text-border">|</span>

          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 text-destructive hover:opacity-70 transition-opacity"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>

      {/* 🔹 Main Content: Image (Left) + Details (Right) */}
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Image Section */}
        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-muted">
          <img
            src={getProductImage()}
            alt={item.product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/Images/placeholder-product.jpg";
            }}
          />
        </div>

        {/* Details Section */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Product Name & Description */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-card-foreground line-clamp-2">
              {item.product.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
              {item.product.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-primary">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
            {item.variant?.mrp && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                ₹{parseFloat(item.variant.mrp).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Variant & Quantity Selection (Second Row) */}
      <div className="flex items-end justify-start sm:justify-end gap-2 px-3 py-3 sm:gap-3 sm:px-4 border-t border-border bg-secondary/10">
        <div className="flex flex-row gap-2 sm:gap-3 items-end">
          {/* Variant Select */}
          {item.product.variants && item.product.variants.length > 1 && (
            <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
              <label className="text-xs font-medium text-muted-foreground">
                Variant
              </label>
              <Select
                  value={selectedVariantId?.toString()}
                  onValueChange={handleVariantChange}
                >
                <SelectTrigger className="w-full sm:w-32 h-8 text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {item.product.variants.map((variant: any, index: number) => {
                    const rawId = variant.variantId ?? variant.id ?? index;
                    const valueStr = rawId.toString();
                    const stock = typeof variant.quantity === "number" ? variant.quantity : Number(variant.quantity) || 0;
                    const isOutOfStock = stock <= 0;

                    return (
                      <SelectItem
                        key={rawId}
                        value={valueStr}
                        disabled={isOutOfStock}
                        aria-disabled={isOutOfStock}
                        title={isOutOfStock ? "Out of stock" : `In stock: ${stock}`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="text-xs">{variant.variantName}</span>
                          {isOutOfStock ? (
                            <span className="text-xxs text-destructive ml-2">Out of stock</span>
                          ) : (
                            <span className="text-xxs text-muted-foreground ml-2">{`IN: ${stock}`}</span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Qty
            </label>
            <div className="flex items-center gap-1 border border-border rounded-md bg-background w-fit overflow-hidden">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-1.5 h-8 hover:bg-secondary transition-colors disabled:opacity-50"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-xs sm:text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-1.5 h-8 hover:bg-secondary transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
