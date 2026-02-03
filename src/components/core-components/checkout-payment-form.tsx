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
import { CreditCard, Wallet, Smartphone } from "lucide-react";

interface CheckoutPaymentFormProps {
  onPaymentComplete: (orderId: string) => void;
  isLoading?: boolean;
}

export default function CheckoutPaymentForm({
  onPaymentComplete,
  isLoading = false,
}: CheckoutPaymentFormProps) {
  const { orderItems, shippingAddress, billingAddress, buildOrderPayload } = useCheckoutContext();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [walletType, setWalletType] = useState("");

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      // Note: Price calculation would need product data
      // For now, we'll use a placeholder
      return sum + (item.quantity * 100); // Placeholder price
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
      return;
    }

    const orderPayload = buildOrderPayload();
    if (!orderPayload) {
      return;
    }

    // Call the parent's payment handler
    // The actual API call will be handled by the parent page
    onPaymentComplete(""); // Will be set by parent
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Payment Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Credit Card
                  </div>
                </SelectItem>
                <SelectItem value="debit_card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="upi">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    UPI
                  </div>
                </SelectItem>
                <SelectItem value="wallet">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Wallet
                  </div>
                </SelectItem>
                <SelectItem value="cod">
                  Cash on Delivery
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Credit/Debit Card Form */}
            {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
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
            )}

            {/* UPI Form */}
            {paymentMethod === "upi" && (
              <div className="pt-4">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  UPI ID <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              </div>
            )}

            {/* Wallet Form */}
            {paymentMethod === "wallet" && (
              <div className="pt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
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
            )}

            {/* COD Message */}
            {paymentMethod === "cod" && (
              <div className="pt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You will pay cash when the order is delivered to your address.
                </p>
              </div>
            )}
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
              <h4 className="font-semibold text-sm">Items ({orderItems.length})</h4>
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Item {index + 1} x {item.quantity}
                  </span>
                  <span className="font-medium">₹{(item.quantity * 100).toLocaleString("en-IN")}</span>
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

            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              disabled={isLoading || !validatePayment()}
            >
              {isLoading ? "Processing..." : "Make Payment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

