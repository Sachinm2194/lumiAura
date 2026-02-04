"use client";

import { RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressCardProps {
  address: any;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
  isDeleting?: boolean;
  addressId: string;
}

export default function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting = false,
  addressId,
}: AddressCardProps) {
  const formatAddress = () => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getAddressTypeLabel = () => {
    const addressType = address.addressType?.toUpperCase();
    switch (addressType) {
      case "HOME":
        return "HOME";
      case "WORK":
        return "WORK";
      case "OTHER":
        return "OTHER";
      default:
        return address.label || "ADDRESS";
    }
  };

  const getAddressTypeColor = () => {
    const addressType = address.addressType?.toUpperCase();
    switch (addressType) {
      case "HOME":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "WORK":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <label
      htmlFor={addressId}
      className={cn(
        "border rounded-lg p-4 transition-all cursor-pointer block",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-primary/50 bg-card"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <RadioGroupItem value={addressId} id={addressId} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground">{address.fullName}</span>
            {address.addressType && (
              <Badge
                variant="secondary"
                className={cn("text-xs font-medium", getAddressTypeColor())}
              >
                {getAddressTypeLabel()}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-1 leading-relaxed">
            {formatAddress()}
          </p>

          <p className="text-sm text-muted-foreground mb-2">{address.phone}</p>

          {address.isDefault && (
            <p className="text-xs text-muted-foreground mb-2">
              Pay on Delivery not available
            </p>
          )}

          {/* Show buttons only when address is selected */}
          {isSelected && (
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                EDIT
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {isDeleting ? "REMOVING..." : "REMOVE"}
              </Button>
              {/* Show "Set as Default" only if address is selected and not already default */}
              {!address.isDefault && onSetDefault && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault();
                  }}
                >
                  <Star className="h-3 w-3 mr-1" />
                  SET AS DEFAULT
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </label>
  );
}

