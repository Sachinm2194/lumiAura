"use client";

import { useEffect, useState, useCallback } from "react";
import { getCart, removeFromCart } from "@/app/api/cart";
import { useSearchContext } from "@/contexts/SearchContext";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { toast } from "react-toastify";
import CartItem from "@/components/core-components/cartItem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBag, Trash, Trash2 } from "lucide-react";

export default function CartPage() {
  const { setSearchHandler } = useSearchContext();
  const { toggleWishlist } = useWishlistContext();

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
        {/* Page Header */}
        

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
