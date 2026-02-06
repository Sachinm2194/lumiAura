"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, Mail, Home, ShoppingBag, Sparkles } from "lucide-react";
import { PrimaryHeader } from "@/components/core-components/primary-header";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Get order number from URL params or path
    const orderId = searchParams.get("order") || window.location.pathname.split("/").pop();
    if (orderId && orderId !== "success") {
      setOrderNumber(orderId);
    } else {
      // Generate a placeholder order number if not provided
      setOrderNumber("ORD-" + Date.now());
    }
  }, [searchParams]);

  return (
    <>
      <PrimaryHeader
        menuActive={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/8 pt-16">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Success Icon with Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="relative bg-primary/10 rounded-full p-6 animate-bounce">
                  <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8 space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground animate-fade-in-up">
                Order Placed Successfully! 🎉
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Thank you for your purchase. We&apos;ve received your order and will process it shortly.
              </p>
            </div>

            {/* Order Number Card */}
            <Card className="mb-6 border-primary/20 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Order Number</CardTitle>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-2xl md:text-3xl font-bold text-primary font-mono tracking-wider">
                    {orderNumber || "Loading..."}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to your registered email address
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Check your inbox for order details</span>
                </div>
              </CardContent>
            </Card>

            {/* What's Next Section */}
            <Card className="mb-6 border-border shadow-md animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  What&apos;s Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Order Confirmation</h4>
                      <p className="text-sm text-muted-foreground">
                        You&apos;ll receive an email confirmation with your order details and tracking information.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Order Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        We&apos;ll start preparing your order for shipment within 24-48 hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Shipping Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        You&apos;ll receive tracking information via email once your order ships.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Button
                onClick={() => router.push("/")}
                className="flex-1 h-12 text-base font-semibold"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
              {/* <Button
                onClick={() => router.push("/orders")}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold"
                size="lg"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                View Orders
              </Button> */}
            </div>

            {/* Help Section */}
            {/* <Card className="border-border bg-muted/30 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-foreground">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    If you have any questions about your order, please don&apos;t hesitate to contact us.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/contact")}
                      className="text-sm"
                    >
                      Contact Support
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/faq")}
                      className="text-sm"
                    >
                      View FAQ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </>
  );
}
