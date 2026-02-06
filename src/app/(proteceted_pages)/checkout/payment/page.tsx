"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutStepper from "@/components/core-components/checkout-stepper";
import CheckoutPaymentForm from "@/components/core-components/checkout-payment-form";
import { useCheckoutContext } from "@/contexts/CheckoutContext";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { orderItems, shippingAddress, billingAddress, buildOrderPayload, clearCheckout, isBuyNow } = useCheckoutContext();
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
    // For Buy Now: step 1 is Address, step 2 is Payment
    // For Cart: step 1 is Cart, step 2 is Address, step 3 is Payment
    if (isBuyNow) {
      if (step === 1) {
        router.push("/checkout/address");
      }
    } else {
      if (step === 1) {
        router.push("/cart");
      } else if (step === 2) {
        router.push("/checkout/address");
      }
    }
  };

  // Determine current step for stepper
  // Buy Now: Address is step 1, Payment is step 2
  // Cart: Cart is step 1, Address is step 2, Payment is step 3
  const stepperCurrentStep = isBuyNow ? 2 : 3;

  const handlePaymentComplete = async (orderNumber: string) => {
    // Clear checkout context
    clearCheckout();
    
    // Redirect to success page with order number
    router.push(`/orders/success?order=${encodeURIComponent(orderNumber)}`);
  };

  if (orderItems.length === 0 || !shippingAddress || !billingAddress) {
    return null;
  }

  return (
    <div className="w-full py-4 pb-20 md:pb-6 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Stepper */}
        <CheckoutStepper 
          currentStep={stepperCurrentStep} 
          onStepClick={handleStepClick} 
          isBuyNow={isBuyNow}
        />

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

