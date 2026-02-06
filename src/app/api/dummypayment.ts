import axiosInstance from "@/lib/helpers/axiosInstance";
import { BuyNowProductData } from "@/types/checkout";

interface OrderDetails {
  email: string;
  paymentMethod: string;
  orderItems: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  notes?: string;
  isBuyNow: boolean;
  buyNowProductData?: BuyNowProductData | null;
  cartProductData?: Record<string, BuyNowProductData>;
}

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}

export async function dummyPaymentEmail(orderDetails: OrderDetails) {
  try {
    // Generate order number
    const orderNumber = generateOrderNumber();

    // Transform order items to match backend API format
    const items = orderDetails.orderItems.map((item) => {
      let productName = "Product";
      let variantName = "";
      let price = 0;

      // Get product data based on buy now or cart
      if (orderDetails.isBuyNow && orderDetails.buyNowProductData) {
        productName = orderDetails.buyNowProductData.name;
        const variant = orderDetails.buyNowProductData.variants?.find(
          (v) => Number(v.id) === Number(item.variantId)
        ) || orderDetails.buyNowProductData.variants?.[0];
        if (variant) {
          variantName = variant.variantName || "";
          price = parseFloat(variant.sellingPrice || "0");
        }
      } else if (!orderDetails.isBuyNow && orderDetails.cartProductData) {
        const productData = orderDetails.cartProductData[item.productId];
        if (productData) {
          productName = productData.name;
          const variant = productData.variants?.find(
            (v) => Number(v.id) === Number(item.variantId)
          ) || productData.variants?.[0];
          if (variant) {
            variantName = variant.variantName || "";
            price = parseFloat(variant.sellingPrice || "0");
          }
        }
      }

      return {
        productName,
        quantity: item.quantity,
        price: price,
        total: price * item.quantity,
        variantName: variantName,
      };
    });

    // Calculate shipping (you can adjust this logic)
    const shipping = 0; // Add shipping calculation if needed

    // Prepare payload for backend API
    const payload = {
      orderNumber,
      items,
      subtotal: orderDetails.totals.subtotal,
      tax: orderDetails.totals.tax,
      shipping: shipping,
      total: orderDetails.totals.total,
      shippingAddress: {
        fullName: orderDetails.shippingAddress.fullName,
        addressLine1: orderDetails.shippingAddress.addressLine1,
        addressLine2: orderDetails.shippingAddress.addressLine2,
        city: orderDetails.shippingAddress.city,
        state: orderDetails.shippingAddress.state,
        postalCode: orderDetails.shippingAddress.postalCode,
        country: orderDetails.shippingAddress.country,
        phone: orderDetails.shippingAddress.phone,
      },
    };

    // Call backend API
    const response = await axiosInstance.post("/payments/dummy-payment", payload);

    return { success: true, orderNumber, data: response.data };
  } catch (error: any) {
    console.error("Error processing dummy payment:", error);
    throw new Error(error?.response?.data?.message || "Failed to process payment. Please try again.");
  }
}
