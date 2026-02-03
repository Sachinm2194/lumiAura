// Address Type
export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Order Item Type
export interface OrderItem {
  productId: string; // UUID
  variantId?: number; // Optional, required if product has variants
  quantity: number;
  productVariant?: {
    size?: string;
    color?: string;
    [key: string]: any; // Other variant properties
  };
}

// Create Order Payload Type
export interface CreateOrderPayload {
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
}

// Payment Method Type
export type PaymentMethod = "credit_card" | "debit_card" | "upi" | "cod" | "wallet";

// Checkout State Type
export interface CheckoutState {
  orderItems: OrderItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  notes?: string;
  isBuyNow: boolean;
}

