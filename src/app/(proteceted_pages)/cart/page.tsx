"use client";

import { useEffect, useState, useCallback } from "react";
import { getCart } from "@/app/api/cart";
import { useSearchContext } from "../layout";

interface CartItem {
  id: number;
  productId: string;
  quantity: number;
  product: {
    productId: string;
    name: string;
    description: string;
    price: number;
    image?: string;
  };
}

export default function CartPage() {
  const { setSearchHandler } = useSearchContext();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Fetch cart items with optional search
  const fetchCart = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await getCart(search);
      const items = Array.isArray(data?.items) ? data.items : [];
      const validItems = items.filter(
        (item: any) => item && item.product && item.product.productId
      );
      setCartItems(validItems);
    } catch {
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔹 Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 🔹 Handle search from header (submit/enter or icon click)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchCart(query || undefined);
  };

  // 🔹 Register search handler with header
  useEffect(() => {
    setSearchHandler(handleSearch);
    return () => setSearchHandler(() => {});
  }, [setSearchHandler]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "Review and manage your items"}
          </p>
        </div>

        {/* Search Result Info */}
        {searchQuery && !isLoading && (
          <p className="text-sm text-muted-foreground mb-6">
            Found {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Cart Items or Empty State */}
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.product.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-primary">
                      ${item.product.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? `No items found for "${searchQuery}".`
                : "Your cart is empty"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
