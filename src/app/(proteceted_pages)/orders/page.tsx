"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GetOrders } from "@/app/api/order";
import { 
  Package, 
  Calendar, 
  MapPin, 
  ChevronRight,
  ShoppingBag,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  total: string;
  product: {
    id: number;
    name: string;
    price: number;
    images?: Array<{
      imageUrl: string;
      isPrimary: boolean;
    }>;
    slug?: string;
  };
  productVariant?: {
    variantName: string;
    sku?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  items: OrderItem[];
  shippingAddress?: {
    fullName?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
};

const getPaymentStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProductImageUrl = (product: OrderItem["product"]) => {
  // Try slug-based image first
  if (product.slug) {
    return `/Images/${product.slug}.PNG`;
  }
  // Fallback to API image
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    return primaryImage.imageUrl;
  }
  return null;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await GetOrders();
        // Sort orders by date (newest first)
        const sortedOrders = Array.isArray(data) 
          ? data.sort((a: Order, b: Order) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          : [];
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/8 pt-2 pb-24 md:pt-4 md:pb-12">
        <div className="container mx-auto px-3 md:px-4 py-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/8 pt-2 pb-24 md:pt-4 md:pb-12">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-accent/10 to-primary/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container mx-auto px-3 md:px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-border shadow-lg">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No Orders Yet</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  You haven&apos;t placed any orders yet. Start shopping to see your orders here!
                </p>
                <Button onClick={() => router.push("/")} className="w-full sm:w-auto" size="sm">
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/8 pt-2 pb-24 md:pt-4 md:pb-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-accent/10 to-primary/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-2 md:py-4 max-w-6xl">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View and track all your orders
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-3 md:space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const hasItems = order.items && order.items.length > 0;

            return (
              <Card
                key={order.id}
                className="border-border shadow-md hover:shadow-lg transition-shadow animate-fade-in-up"
              >
                <CardHeader className="px-4 md:px-6 pt-3 md:pt-4 pb-2 md:pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-primary flex-shrink-0" />
                        <CardTitle className="text-lg sm:text-xl font-bold truncate">
                          {order.orderNumber}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        {order.shippingAddress?.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">
                              {order.shippingAddress.city}
                              {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badges & Total */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)} variant="outline">
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-foreground">
                          ₹{parseFloat(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 md:px-6 pb-3 md:pb-4">
                  {/* Order Items Preview */}
                  {hasItems && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          Items ({order.items.length})
                        </h3>
                        {order.items.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-xs sm:text-sm"
                          >
                            {isExpanded ? "Show Less" : `View All ${order.items.length} Items`}
                            <ChevronRight
                              className={`w-4 h-4 ml-1 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {(isExpanded ? order.items : order.items.slice(0, 2)).map((item) => {
                          const imageUrl = getProductImageUrl(item.product);
                          
                          return (
                            <div
                              key={item.id}
                              className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg border border-border"
                            >
                              {/* Product Image */}
                              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-background border border-border">
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={item.product.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/Images/placeholder.png";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-0.5 truncate">
                                  {item.product.name}
                                </h4>
                                {item.productVariant?.variantName && (
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Variant: {item.productVariant.variantName}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    Qty: {item.quantity}
                                  </p>
                                  <p className="text-sm sm:text-base font-semibold text-foreground">
                                    ₹{parseFloat(item.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="pt-3 border-t border-border mt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs sm:text-sm">
                      <div className="text-muted-foreground">
                        <span className="font-medium">Order Date:</span> {formatDateTime(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="text-lg font-bold text-foreground">
                          ₹{parseFloat(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

