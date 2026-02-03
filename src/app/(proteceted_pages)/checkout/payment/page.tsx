"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutStepper from "@/components/core-components/checkout-stepper";
import CheckoutPaymentForm from "@/components/core-components/checkout-payment-form";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { CreateOrder } from "@/app/api/order";
import { toast } from "react-toastify";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { orderItems, shippingAddress, billingAddress, buildOrderPayload, clearCheckout } = useCheckoutContext();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if no items or addresses
  useEffect(() => {
    if (orderItems.length === 0) {
      router.push("/cart");
      return;
    }
    if (!shippingAddress || !billingAddress) {
      router.push("/checkout/address");
      return;
    }
  }, [orderItems.length, shippingAddress, billingAddress, router]);

  const handleStepClick = (step: number) => {
    if (step === 1) {
      router.push("/cart");
    } else if (step === 2) {
      router.push("/checkout/address");
    }
  };

  const handlePaymentComplete = async () => {
    const orderPayload = buildOrderPayload();
    if (!orderPayload) {
      toast.error("Unable to process order. Please try again.");
      return;
    }

    setIsProcessing(true);
    try {
      const order = await CreateOrder(orderPayload);
      
      // Clear checkout context
      clearCheckout();
      
      // Show success message
      toast.success("Order placed successfully!");
      
      // Redirect to order confirmation (or orders page)
      // For now, redirect to home. You can create an order confirmation page later
      setTimeout(() => {
        router.push(`/orders/${order.id || order.orderId || "success"}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error?.response?.data?.message || "Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (orderItems.length === 0 || !shippingAddress || !billingAddress) {
    return null;
  }

  return (
    <div className="w-full py-4 pb-20 md:pb-6 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Stepper */}
        <CheckoutStepper currentStep={3} onStepClick={handleStepClick} />

        <div className="mt-6">
          <CheckoutPaymentForm
            onPaymentComplete={handlePaymentComplete}
            isLoading={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}

