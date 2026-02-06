"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCart, removeFromCart, updateCartItem } from "@/app/api/cart";
import { useSearchContext } from "@/contexts/SearchContext";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { useCartContext } from "@/contexts/CartContext";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { toast } from "react-toastify";
import CartItem from "@/components/core-components/cartItem";
import CheckoutStepper from "@/components/core-components/checkout-stepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBag, Trash, Trash2 } from "lucide-react";
import { OrderItem, BuyNowProductData } from "@/types/checkout";

export default function CartPage() {
  const router = useRouter();
  const { setSearchHandler } = useSearchContext();
  const { toggleWishlist } = useWishlistContext();
  const { refreshCart } = useCartContext();
  const { setOrderItems, setIsBuyNow } = useCheckoutContext();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // 🔹 Fetch cart items with optional search
  const fetchCart = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await getCart(search);
      const items = Array.isArray(data?.items) ? data.items : [];
      const validItems = items.filter(
        (item: any) => item && item.product && item.product.productId,
      );
      setCartItems(validItems);
      // Select all items by default
      setSelectedItems(new Set(validItems.map((item: any) => item.id)));
    } catch {
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔹 Initial fetch - run only once on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // 🔹 Handle search from header (submit/enter or icon click)
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      fetchCart(query || undefined);
    },
    [fetchCart],
  );

  // 🔹 Register search handler with header
  useEffect(() => {
    setSearchHandler(handleSearch);
    return () => setSearchHandler(() => {});
  }, [handleSearch, setSearchHandler]);

  // 🔹 Handle item selection
  const handleSelectItem = (itemId: number, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  // 🔹 Handle select/deselect all
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // 🔹 Remove single item via API
  const handleRemoveItem = async (itemId: number) => {
    try {
      const item = cartItems.find((i) => i.id === itemId);
      if (!item?.product?.productId) return;

      // Call removeFromCart API with single item
      await removeFromCart([item.product.productId]);
      
      // Refresh cart badge from server
      await refreshCart();
      
      // Remove from local state
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      selectedItems.delete(itemId);
      setSelectedItems(new Set(selectedItems));
      
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  // 🔹 Move to wishlist
  const handleMoveToWishlist = async (product: any) => {
    try {
      await toggleWishlist(product, false);
    } catch (error) {
      console.error("Error moving to wishlist:", error);
    }
  };

  // 🔹 Remove selected items via API
  const handleRemoveSelected = async () => {
    try {
      // Get product IDs for selected items
      const selectedProducts = cartItems
        .filter((item) => selectedItems.has(item.id))
        .map((item) => item.product?.productId)
        .filter(Boolean);

      if (selectedProducts.length === 0) return;

      // Call removeFromCart API with multiple items
      await removeFromCart(selectedProducts);
      
      // Refresh cart badge from server
      await refreshCart();
      
      // Remove from local state
      setCartItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      
      toast.success(`${selectedProducts.length} item(s) removed from cart`);
    } catch (error) {
      console.error("Error removing items:", error);
      toast.error("Failed to remove items");
    }
  };

  // 🔹 Move selected to wishlist
  const handleMoveSelectedToWishlist = async () => {
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.has(item.id),
    );
    for (const item of selectedCartItems) {
      await handleMoveToWishlist(item.product);
    }
    setCartItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  // 🔹 Unified update handler - always sends both quantity and variantId
  const updateCartItemData = async (
    itemId: number,
    updates: { quantity?: number; variantId?: string | number }
  ) => {
    try {
      const item = cartItems.find((i) => i.id === itemId);
      if (!item?.product?.productId) return;

      // Get current variant ID - check multiple sources
      let currentVariantId: number | string | undefined = 
        item.variant?.variantId || 
        item.variant?.id ||
        item.product?.variants?.[0]?.variantId ||
        item.product?.variants?.[0]?.id;

      let payloadQuantity: number;
      let payloadVariantId: number | string;

      // Determine what goes into payload based on what's being updated
      if (updates.quantity !== undefined) {
        // Quantity is being updated: send UPDATED qty + CURRENT variant
        payloadQuantity = updates.quantity;
        payloadVariantId = currentVariantId || 0;
      } else if (updates.variantId !== undefined) {
        // Variant is being updated: send CURRENT qty + UPDATED variant
        payloadQuantity = item.quantity;
        // Convert to number
        const variantId = updates.variantId;
        if (typeof variantId === "string") {
          payloadVariantId = parseInt(variantId, 10);
        } else {
          payloadVariantId = variantId;
        }
      } else {
        // No update provided
        return;
      }

      // Always send both fields in payload (mandatory)
      const payload = {
        quantity: payloadQuantity,
        variantId: Number(payloadVariantId),
      };

      await updateCartItem(item.product.productId, payload);

      // If variant changed, find and update variant details
      if (updates.variantId) {
        const selectedVariant = item.product.variants?.find(
          (v: any) =>
            v.variantId === payloadVariantId ||
            v.id === payloadVariantId
        );

        setCartItems((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  quantity: payloadQuantity,
                  variant: selectedVariant || { variantId: payloadVariantId },
                }
              : i
          )
        );

        // toast.success("Variant updated");
      } else {
        // Only quantity changed
        setCartItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, quantity: payloadQuantity } : i
          )
        );

        // toast.success("Quantity updated");
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      toast.error("Failed to update cart item");
    }
  };

  // 🔹 Handle quantity change
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    updateCartItemData(itemId, { quantity: newQuantity });
  };

  // 🔹 Handle variant change
  const handleVariantChange = (itemId: number, variantId: string | number) => {
    updateCartItemData(itemId, { variantId });
  };

  // 🔹 Handle Place Order
  const handlePlaceOrder = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item to place order");
      return;
    }

    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.has(item.id),
    );

    // Map cart items to order items and extract product data
    const orderItems: OrderItem[] = [];
    const productDataMap: Record<string, BuyNowProductData> = {};

    selectedCartItems.forEach((item) => {
      const variantId = item.variant?.variantId || item.variant?.id;
      const variant = item.variant || item.product?.variants?.[0];
      
      // Extract variant properties
      const productVariant: Record<string, any> = {};
      if (variant?.variantName) {
        // Try to parse variant name for size/color
        const variantName = variant.variantName.toLowerCase();
        if (variantName.includes("ml") || variantName.includes("g")) {
          productVariant.size = variant.variantName;
        } else {
          productVariant.color = variant.variantName;
        }
      }

      // Create order item
      orderItems.push({
        productId: item.product.productId,
        ...(variantId && { variantId: Number(variantId) }),
        quantity: item.quantity,
        ...(Object.keys(productVariant).length > 0 && { productVariant }),
      });

      // Extract and store product data for display
      if (item.product) {
        productDataMap[item.product.productId] = {
          productId: item.product.productId,
          name: item.product.name || item.product.productName || "Product",
          slug: item.product.slug || "",
          shortDescription: item.product.shortDescription || item.product.description,
          images: item.product.images || [],
          variants: item.product.variants?.map((v: any) => ({
            id: v.variantId || v.id,
            variantName: v.variantName || "",
            sellingPrice: v.sellingPrice || "0",
            mrp: v.mrp,
            quantity: v.quantity || 0,
          })) || [],
        };
      }
    });

    // Set order items and product data in checkout context
    setOrderItems(orderItems, productDataMap);
    setIsBuyNow(false);
    
    // Navigate to address page
    router.push("/checkout/address");
  };

  // 🔹 Calculate totals
  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.has(item.id),
  );
  const subtotal = selectedCartItems.reduce((sum, item) => {
    const price = parseFloat(item.variant?.sellingPrice || "0");
    return sum + price * item.quantity;
  }, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-4 pb-20 md:pb-2 md:py-6 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Stepper */}
        <CheckoutStepper currentStep={1} isBuyNow={false} />

        {/* Search Result Info */}
        {searchQuery && !isLoading && (
          <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
            Found {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Cart Empty State */}
        {cartItems.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <ShoppingBag className="w-12 md:w-16 h-12 md:h-16 text-muted-foreground mx-auto mb-3 md:mb-4 opacity-50" />
            <p className="text-muted-foreground text-base md:text-lg">
              {searchQuery
                ? `No items found for "${searchQuery}".`
                : "Your cart is empty"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Side - Cart Items List */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {/* Select All / Deselect All */}
              <div className="flex flex-row justify-between gap-2 sm:gap-3 px-3 md:px-4 py-2 md:py-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      cartItems.length > 0 &&
                      selectedItems.size === cartItems.length
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAll(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="select-all"
                    className="text-xs md:text-sm font-medium cursor-pointer"
                  >
                    {selectedItems.size === cartItems.length &&
                    cartItems.length > 0
                      ? `Deselect All (${cartItems.length})`
                      : `Select All (${cartItems.length})`}
                  </label>
                </div>
                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    {/* <span
                      onClick={handleMoveSelectedToWishlist}
                      className="cursor-pointer text-primary hover:underline"
                    >
                      Move {selectedItems.size} Wishlist
                    </span>

                    <span className="text-muted-foreground hidden sm:inline">|</span> */}

                    <span
                      onClick={handleRemoveSelected}
                      className="cursor-pointer flex items-center gap-2 text-destructive hover:underline"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Remove
                    </span>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-3 md:space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItems.has(item.id)}
                    onSelect={handleSelectItem}
                    onRemove={handleRemoveItem}
                    onMoveToWishlist={handleMoveToWishlist}
                    onQuantityChange={handleQuantityChange}
                    onVariantChange={handleVariantChange}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Order Summary - Desktop Only */}
            <div className="order-first lg:order-last hidden lg:block">
              <Card className="p-4 md:p-6 sticky top-4 md:top-6 space-y-4 md:space-y-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground">
                    Order Summary
                  </h2>
                </div>

                {/* Summary Details */}
                <div className="space-y-2 md:space-y-3 border-b border-border pb-3 md:pb-4">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">
                      Items ({selectedItems.size})
                    </span>
                    <span className="font-medium">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">
                      ₹{tax.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm md:text-base text-foreground">Total</span>
                  <span className="text-xl md:text-2xl font-bold text-primary">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Place Order Button */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-auto rounded-lg text-sm md:text-base"
                  disabled={selectedItems.size === 0}
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>

                {/* Info Text */}
                {selectedItems.size === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Select items to proceed
                  </p>
                )}
                {selectedItems.size > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {cartItems.length - selectedItems.size} item{cartItems.length - selectedItems.size !== 1 ? "s" : ""} not selected
                  </p>
                )}
              </Card>
            </div>

            {/* Mobile - Fixed Place Order Button */}
            <div className="lg:hidden fixed bottom-16 left-0 right-0 px-3 py-2 bg-card border-t border-border">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-auto rounded-lg text-sm"
                disabled={selectedItems.size === 0}
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
