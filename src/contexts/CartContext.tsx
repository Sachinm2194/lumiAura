"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart } from "@/app/api/cart";
import { useAuth } from "./AuthContext";

interface CartItem {
  id: number;
  quantity: number;
  [key: string]: any;
}

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate cart count as number of unique items in cart
  const cartCount = cartItems.length;

  // Fetch cart from API
  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    try {
      setIsLoading(true);
      const data = await getCart();
      const items = Array.isArray(data?.items) ? data.items : [];
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Fetch cart on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchCartCount();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, authLoading, fetchCartCount]);

  // Refresh cart function
  const refreshCart = useCallback(async () => {
    await fetchCartCount();
  }, [fetchCartCount]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        isLoading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
}

