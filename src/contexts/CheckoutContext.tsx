"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CheckoutState, OrderItem, Address } from "@/types/checkout";

interface CheckoutContextType extends CheckoutState {
  setOrderItems: (items: OrderItem[]) => void;
  addOrderItem: (item: OrderItem) => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setNotes: (notes: string) => void;
  setIsBuyNow: (isBuyNow: boolean) => void;
  clearCheckout: () => void;
  buildOrderPayload: () => {
    items: OrderItem[];
    shippingAddress: Address;
    billingAddress: Address;
    notes?: string;
  } | null;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const STORAGE_KEY = "checkout_state";

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>({
    orderItems: [],
    shippingAddress: null,
    billingAddress: null,
    notes: undefined,
    isBuyNow: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      }
    } catch (error) {
      console.error("Error loading checkout state:", error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving checkout state:", error);
    }
  }, [state]);

  const setOrderItems = useCallback((items: OrderItem[]) => {
    setState((prev) => ({ ...prev, orderItems: items }));
  }, []);

  const addOrderItem = useCallback((item: OrderItem) => {
    setState((prev) => ({ ...prev, orderItems: [item] }));
  }, []);

  const setShippingAddress = useCallback((address: Address) => {
    setState((prev) => ({ ...prev, shippingAddress: address }));
  }, []);

  const setBillingAddress = useCallback((address: Address) => {
    setState((prev) => ({ ...prev, billingAddress: address }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  const setIsBuyNow = useCallback((isBuyNow: boolean) => {
    setState((prev) => ({ ...prev, isBuyNow }));
  }, []);

  const clearCheckout = useCallback(() => {
    setState({
      orderItems: [],
      shippingAddress: null,
      billingAddress: null,
      notes: undefined,
      isBuyNow: false,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing checkout state:", error);
    }
  }, []);

  const buildOrderPayload = useCallback(() => {
    if (
      !state.shippingAddress ||
      !state.billingAddress ||
      state.orderItems.length === 0
    ) {
      return null;
    }

    return {
      items: state.orderItems,
      shippingAddress: state.shippingAddress,
      billingAddress: state.billingAddress,
      ...(state.notes && { notes: state.notes }),
    };
  }, [state]);

  return (
    <CheckoutContext.Provider
      value={{
        ...state,
        setOrderItems,
        addOrderItem,
        setShippingAddress,
        setBillingAddress,
        setNotes,
        setIsBuyNow,
        clearCheckout,
        buildOrderPayload,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckoutContext must be used within a CheckoutProvider");
  }
  return context;
}

