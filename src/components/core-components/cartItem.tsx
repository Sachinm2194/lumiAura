"use client";

import React from "react";
import { Trash2, Heart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useWishlistContext } from "@/contexts/WishlistContext";

interface CartItemProps {
  item: any;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onRemove: (id: number) => void;
  onMoveToWishlist: (product: any) => void;
}

export default function CartItem({
  item,
  isSelected,
  onSelect,
  onRemove,
  onMoveToWishlist,
}: CartItemProps) {
  const { isWishlisted } = useWishlistContext();
  const isInWishlist = isWishlisted(item.product.productId);

  const handleMoveToWishlist = async () => {
    onMoveToWishlist(item.product);
    onRemove(item.id);
  };

  const price = parseFloat(item.variant?.sellingPrice || "0");

  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      {/* 🔹 Top Row: Select + Actions (Mobile First) */}
      <div className="flex items-center justify-between gap-2 mb-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelect(item.id, checked as boolean)
            }
            className="w-5 h-5"
          />
          <span className="text-muted-foreground">Select</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            onClick={handleMoveToWishlist}
            className={`cursor-pointer flex items-center gap-1 hover:underline ${
              isInWishlist ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Heart
              size={14}
              fill={isInWishlist ? "currentColor" : "none"}
            />
            Wishlist
          </span>

          <span className="text-muted-foreground">|</span>

          <span
            onClick={() => onRemove(item.id)}
            className="cursor-pointer flex items-center gap-1 text-destructive hover:underline"
          >
            <Trash2 size={14} />
            Remove
          </span>
        </div>
      </div>

      {/* 🔹 Product Content */}
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
            {item.product.name}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.product.description}
          </p>

          {item.variant && (
            <p className="text-xs text-muted-foreground mt-1">
              {item.variant.variantName}
            </p>
          )}
        </div>

        {/* 🔹 Price */}
        <div className="text-right flex-shrink-0">
          <p className="text-base sm:text-lg font-bold text-primary">
            ₹{price.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-muted-foreground">
            Qty: {item.quantity}
          </p>
        </div>
      </div>
    </div>
  );
}
