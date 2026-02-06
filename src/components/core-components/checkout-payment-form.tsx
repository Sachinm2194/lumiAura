"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethod } from "@/types/checkout";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { useAuth } from "@/contexts/AuthContext";
import OrderSummaryItem from "@/components/core-components/order-summary-item";
import { CreditCard, Wallet, Smartphone, Star, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { dummyPaymentEmail } from "@/app/api/dummypayment";
import { toast } from "react-toastify";

interface CheckoutPaymentFormProps {
  onPaymentComplete: (orderId: string) => void;
  isLoading?: boolean;
}

export default function CheckoutPaymentForm({
  onPaymentComplete,
  isLoading = false,
}: CheckoutPaymentFormProps) {
  const { orderItems, shippingAddress, billingAddress, buildOrderPayload, isBuyNow, buyNowProductData, cartProductData, notes } = useCheckoutContext();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [walletType, setWalletType] = useState("");
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate order totals with actual prices
  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      // Get variant price from product data
      if (isBuyNow && buyNowProductData) {
        const variant = buyNowProductData.variants?.find(
          (v) => Number(v.id) === Number(item.variantId)
        ) || buyNowProductData.variants?.[0];
        const price = variant ? parseFloat(variant.sellingPrice || "0") : 0;
        return sum + price * item.quantity;
      }
      // For cart items, use cartProductData
      if (!isBuyNow && cartProductData) {
        const productData = cartProductData[item.productId];
        if (productData) {
          const variant = productData.variants?.find(
            (v) => Number(v.id) === Number(item.variantId)
          ) || productData.variants?.[0];
          const price = variant ? parseFloat(variant.sellingPrice || "0") : 0;
          return sum + price * item.quantity;
        }
      }
      return sum; // Fallback: no price available
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  const validatePayment = (): boolean => {
    switch (paymentMethod) {
      case "credit_card":
      case "debit_card":
        if (!cardNumber || !cardName || !expiryDate || !cvv) {
          return false;
        }
        if (cardNumber.replace(/\s/g, "").length < 16) return false;
        if (cvv.length < 3) return false;
        return true;
      case "upi":
        if (!upiId || !upiId.includes("@")) return false;
        return true;
      case "wallet":
        if (!walletType) return false;
        return true;
      case "cod":
        return true; // COD doesn't need validation
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePayment()) {
      toast.error("Please fill in all required payment details");
      return;
    }

    const orderPayload = buildOrderPayload();
    if (!orderPayload) {
      toast.error("Please complete all checkout steps");
      return;
    }

    if (!user?.email) {
      toast.error("User email not found. Please login again.");
      return;
    }

    if (!shippingAddress || !billingAddress) {
      toast.error("Shipping and billing addresses are required");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order details for payment
      const orderDetails = {
        email: user.email,
        paymentMethod: paymentMethod,
        orderItems: orderItems.map(item => ({
          productId: item.productId,
          variantId: String(item.variantId || ""),
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        billingAddress: {
          fullName: billingAddress.fullName,
          addressLine1: billingAddress.addressLine1,
          addressLine2: billingAddress.addressLine2,
          city: billingAddress.city,
          state: billingAddress.state,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country,
          phone: billingAddress.phone,
        },
        totals: {
          subtotal,
          tax,
          total,
        },
        notes: notes,
        isBuyNow,
        buyNowProductData,
        cartProductData,
      };

      // Process dummy payment (sends email via backend)
      const result = await dummyPaymentEmail(orderDetails);
      
      toast.success(`Payment processed! Order ${result.orderNumber} confirmed.`);
      
      // Call the parent's payment handler with order number
      onPaymentComplete(result.orderNumber);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error?.message || "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Payment methods configuration
  const paymentMethods = [
    {
      value: "upi" as PaymentMethod,
      label: "UPI",
      icon: Smartphone,
      isRecommended: true,
    },
    {
      value: "debit_card" as PaymentMethod,
      label: "Debit Card",
      icon: CreditCard,
    },
    {
      value: "credit_card" as PaymentMethod,
      label: "Credit Card",
      icon: CreditCard,
    },
    // {
    //   value: "wallet" as PaymentMethod,
    //   label: "Wallet",
    //   icon: Wallet,
    // },
  ];

  // Helper function to render payment method UI
  const renderPaymentMethodUI = (method: PaymentMethod) => {
    switch (method) {
      case "credit_card":
        return (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">
                Card Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                  const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                  setCardNumber(formatted.slice(0, 19));
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Cardholder Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Expiry Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const formatted = value.length > 2
                      ? `${value.slice(0, 2)}/${value.slice(2, 4)}`
                      : value;
                    setExpiryDate(formatted.slice(0, 5));
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  CVV <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setCvv(value.slice(0, 4));
                  }}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        );
      case "debit_card":
        return (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">
                Card Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                  const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                  setCardNumber(formatted.slice(0, 19));
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Cardholder Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Expiry Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const formatted = value.length > 2
                      ? `${value.slice(0, 2)}/${value.slice(2, 4)}`
                      : value;
                    setExpiryDate(formatted.slice(0, 5));
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  CVV <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setCvv(value.slice(0, 4));
                  }}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        );
      case "upi":
        return (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">
                UPI ID <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your UPI ID (e.g., yourname@paytm, yourname@ybl)
              </p>
            </div>
          </div>
        );
      case "wallet":
        return (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">
                Wallet Type <span className="text-destructive">*</span>
              </label>
              <Select value={walletType} onValueChange={setWalletType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paytm">Paytm</SelectItem>
                  <SelectItem value="phonepe">PhonePe</SelectItem>
                  <SelectItem value="gpay">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Payment Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          {/* <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader> */}
          <CardContent>
            {/* Mobile Layout - Methods with UI inline */}
            <div className="md:hidden space-y-4">
              {/* Recommended Label */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-foreground">Recommended</span>
              </div>
              
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.value;
                return (
                  <div key={method.value} className="space-y-0">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        "w-full p-3 rounded-md transition-all duration-200 text-left",
                        isSelected
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : "bg-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-md flex-shrink-0",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-semibold text-sm",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {method.label}
                          </h4>
                        </div>
                      </div>
                    </button>
                    {/* Show UI directly below selected method */}
                    {isSelected && (
                      <div className="px-3 pb-4">
                        {renderPaymentMethodUI(method.value)}
                        {/* Make Payment Button */}
                        <div className="pt-4 border-t mt-4">
                          <Button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full"
                            size="lg"
                            disabled={isLoading || !validatePayment()}
                          >
                            {isLoading ? "Processing..." : "Make Payment"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Layout - Side by side */}
            <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-6">
              {/* Left Side - Payment Methods List */}
              <div className="space-y-2">
                {/* Recommended Label */}
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-foreground">Recommended</span>
                </div>
                
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        "w-full p-3 rounded-md transition-all duration-200 text-left",
                        isSelected
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : "bg-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-md flex-shrink-0",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-semibold text-sm",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {method.label}
                          </h4>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Side - Payment Details Form */}
              <div className="space-y-4">
                {renderPaymentMethodUI(paymentMethod)}
                
                {/* Make Payment Button - Right side of payment form */}
                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                    disabled={isLoading || !validatePayment()}
                  >
                    {isLoading ? "Processing..." : "Make Payment"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Order Summary Accordion */}
        <div className="lg:hidden">
          <Card>
            <button
              type="button"
              onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
              className="w-full"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Order Summary</CardTitle>
                {isOrderSummaryOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </CardHeader>
            </button>
            {isOrderSummaryOpen && (
              <CardContent className="space-y-4 pt-0">
                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Items ({orderItems.length})</h4>
                  <div className="space-y-0">
                    {orderItems.map((item, index) => (
                      <OrderSummaryItem
                        key={index}
                        orderItem={item}
                        productData={isBuyNow ? buyNowProductData : null}
                        cartProductData={!isBuyNow ? cartProductData : undefined}
                        index={index}
                        isBuyNow={isBuyNow}
                      />
                    ))}
                  </div>
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

                {/* Shipping Address Summary */}
                {shippingAddress && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">Shipping Address</h4>
                    <p className="text-xs text-muted-foreground">
                      {shippingAddress.fullName}<br />
                      {shippingAddress.addressLine1}<br />
                      {shippingAddress.addressLine2 && `${shippingAddress.addressLine2}\n`}
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                      {shippingAddress.country}
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Desktop Order Summary - Hidden on mobile */}
      <div className="hidden lg:block lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Items ({orderItems.length})</h4>
              <div className="space-y-0">
                {orderItems.map((item, index) => (
                  <OrderSummaryItem
                    key={index}
                    orderItem={item}
                    productData={isBuyNow ? buyNowProductData : null}
                    cartProductData={!isBuyNow ? cartProductData : undefined}
                    index={index}
                    isBuyNow={isBuyNow}
                  />
                ))}
              </div>
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

            {/* Shipping Address Summary */}
            {shippingAddress && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm mb-2">Shipping Address</h4>
                <p className="text-xs text-muted-foreground">
                  {shippingAddress.fullName}<br />
                  {shippingAddress.addressLine1}<br />
                  {shippingAddress.addressLine2 && `${shippingAddress.addressLine2}\n`}
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                  {shippingAddress.country}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

