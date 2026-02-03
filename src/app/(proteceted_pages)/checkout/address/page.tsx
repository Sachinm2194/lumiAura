"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CheckoutStepper from "@/components/core-components/checkout-stepper";
import CheckoutAddressForm from "@/components/core-components/checkout-address-form";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { Address } from "@/types/checkout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function CheckoutAddressPage() {
  const router = useRouter();
  const {
    orderItems,
    shippingAddress,
    billingAddress,
    setShippingAddress,
    setBillingAddress,
    isBuyNow,
  } = useCheckoutContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<{ validateAndSubmit: () => void }>(null);

  // Redirect if no items in checkout
  useEffect(() => {
    if (orderItems.length === 0) {
      router.push("/cart");
    }
  }, [orderItems.length, router]);

  const handleStepClick = (step: number) => {
    if (step === 1) {
      router.push("/cart");
    }
  };

  const handleContinue = async (shipping: Address, billing: Address) => {
    setIsSubmitting(true);
    setShippingAddress(shipping);
    setBillingAddress(billing);
    // Small delay to ensure state is set
    setTimeout(() => {
      router.push("/checkout/payment");
    }, 100);
  };

  // Calculate order summary
  const calculateSummary = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      return sum + (item.quantity * 100); // Placeholder - would need actual product prices
    }, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateSummary();

  if (orderItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-4 pb-20 md:pb-6 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Stepper */}
        <CheckoutStepper currentStep={2} onStepClick={handleStepClick} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Address Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutAddressForm
                  ref={formRef}
                  initialShippingAddress={shippingAddress}
                  initialBillingAddress={billingAddress}
                  onContinue={handleContinue}
                  showContinueButton={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Items ({orderItems.length})
                  </h4>
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isBuyNow ? "Item" : `Item ${index + 1}`} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        ₹{(item.quantity * 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      if (formRef.current) {
                        formRef.current.validateAndSubmit();
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

