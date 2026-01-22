"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GetProductBySlug } from "@/app/api/products";
import { Product, ProductVariant } from "@/types/product";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import Footer from "@/components/core-components/footer";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Star, 
  ShoppingCart, 
  ChevronLeft, 
  Share2, 
  Check,
  Minus,
  Plus,
  AlertCircle,
  Package,
  Truck,
  Shield,
  ArrowLeft
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import ProductCard from "@/components/core-components/product-card";
import { GetAllProducts } from "@/app/api/products";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.["product-view"] as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "ingredients" | "benefits" | "howtouse">("description");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const { isWishlisted, toggleWishlist } = useWishlistContext();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      try {
        const data = await GetProductBySlug(slug);
        setProduct(data);
        
        // Set default variant
        const defaultVariant = data.variants?.find((v: ProductVariant) => v.isDefault) || data.variants?.[0];
        setSelectedVariant(defaultVariant || null);
        
        // Reset quantity when product loads
        setQuantity(1);
        
        // Fetch related products
        const allProducts = await GetAllProducts();
        const related = Array.isArray(allProducts) 
          ? allProducts
              .filter((p: Product) => 
                p.id !== data.id && 
                p.categoryId === data.categoryId
              )
              .slice(0, 4)
          : [];
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug, router]);

  // Get product images
  const getProductImages = () => {
    if (!product) return [];
    
    const images = product.images || [];
    if (images.length > 0) {
      return images.map(img => img.url);
    }
    
    // Fallback to slug-based image
    if (product.slug) {
      return [`/Images/${product.slug}.PNG`];
    }
    
    return ["/Images/placeholder-product.jpg"];
  };

  const images = getProductImages();
  const isWishlistedProduct = product ? isWishlisted(product.productId) : false;

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!product) return;
    try {
      await toggleWishlist(product, !isWishlistedProduct);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }
    
    if (selectedVariant.quantity === 0) {
      toast.error("This variant is out of stock");
      return;
    }
    
    // TODO: Implement add to cart API
    // Payload should include: productId, variantId, quantity
    const cartItem = {
      productId: product.productId,
      variantId: selectedVariant.id,
      quantity: quantity,
      variant: selectedVariant
    };
    
    console.log("Add to cart:", cartItem);
    toast.success(`${product.name} (${selectedVariant.variantName}) x${quantity} added to cart`);
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const maxQuantity = selectedVariant?.quantity || 10;
    setQuantity(prev => Math.max(1, Math.min(maxQuantity, prev + delta)));
  };

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (!selectedVariant) return 0;
    const mrp = parseFloat(selectedVariant.mrp);
    const selling = parseFloat(selectedVariant.sellingPrice);
    return Math.round(((mrp - selling) / mrp) * 100);
  };

  // Format price
  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString("en-IN")}`;
  };

  if (isLoading) {
    return (
      <>
        <PrimaryHeader menuActive={false} onMenuToggle={() => {}} />
        <div className="min-h-screen ">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image skeleton */}
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
              {/* Info skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-12 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <PrimaryHeader menuActive={false} onMenuToggle={() => {}} />
        <div className="min-h-screen  flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => router.push("/")}>Go to Home</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const discount = calculateDiscount();
  const rating = parseFloat(product.averageRating || "0");
  const reviewCount = product.reviewCount || 0;

  return (
    <>
      <PrimaryHeader menuActive={false} onMenuToggle={() => {}} />
      
      <div className="min-h-screen  bg-background">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <span>/</span>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link 
                  href={`/category/${product.category.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div 
                className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-zoom-in group"
                onClick={() => setIsImageZoomed(!isImageZoomed)}
              >
                <Image
                  src={images[selectedImageIndex] || images[0]}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/Images/placeholder-product.jpg";
                  }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-green-500 text-white">New</Badge>
                  )}
                  {product.isFeatured && (
                    <Badge className="bg-blue-500 text-white">Featured</Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white">{discount}% OFF</Badge>
                  )}
                </div>

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle();
                  }}
                >
                  <Heart
                    className={`h-5 w-5 transition-all ${
                      isWishlistedProduct
                        ? "fill-red-500 text-red-500"
                        : "fill-transparent text-gray-700"
                    }`}
                  />
                </Button>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/50"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/Images/placeholder-product.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand/Category */}
              {product.category && (
                <div className="text-sm text-muted-foreground">
                  {product.category.name}
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                {selectedVariant ? (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-foreground">
                        {formatPrice(selectedVariant.sellingPrice)}
                      </span>
                      {parseFloat(selectedVariant.mrp) > parseFloat(selectedVariant.sellingPrice) && (
                        <>
                          <span className="text-xl text-muted-foreground line-through">
                            {formatPrice(selectedVariant.mrp)}
                          </span>
                          <Badge variant="destructive" className="text-sm">
                            {discount}% OFF
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Inclusive of all taxes
                    </p>
                  </>
                ) : product.variants && product.variants.length === 0 ? (
                  <div className="text-muted-foreground">
                    <p className="text-lg">Price not available</p>
                    <p className="text-sm">No variants available for this product</p>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <p className="text-lg">Loading price...</p>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">
                      {product.variants.length > 1 ? "Select Size:" : "Size:"}
                    </label>
                    {selectedVariant && (
                      <span className="text-xs text-muted-foreground">
                        SKU: {selectedVariant.sku}
                      </span>
                    )}
                  </div>
                  {product.variants.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <Button
                          key={variant.id}
                          variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                          onClick={() => {
                            setSelectedVariant(variant);
                            setQuantity(1); // Reset quantity when variant changes
                          }}
                          className="min-w-[100px] relative"
                          disabled={variant.quantity === 0}
                        >
                          {variant.variantName}
                          {variant.isDefault && (
                            <span className="ml-1 text-xs opacity-70">(Default)</span>
                          )}
                          {variant.quantity === 0 && (
                            <span className="ml-2 text-xs opacity-70">(Out of Stock)</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    // Single variant - show as read-only
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                      <span className="font-medium">{product.variants[0].variantName}</span>
                      {product.variants[0].isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                      {product.variants[0].quantity === 0 && (
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Quantity:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[60px] text-center font-semibold">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (selectedVariant?.quantity || 10)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedVariant && (
                    <span className="text-sm text-muted-foreground">
                      {selectedVariant.quantity > 0 
                        ? `${selectedVariant.quantity} available`
                        : "Out of stock"
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.quantity === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    // TODO: Implement buy now
                    toast.info("Buy Now feature coming soon");
                  }}
                  disabled={!selectedVariant || selectedVariant.quantity === 0}
                >
                  Buy Now
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex flex-col items-center text-center">
                  <Package className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-semibold">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-semibold">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-semibold">Easy Returns</span>
                </div>
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.shortDescription || "",
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Share Product
              </Button>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12 space-y-6">
            {/* Tab Navigation */}
            <div className="border-b">
              <div className="flex flex-wrap gap-4">
                {[
                  { id: "description", label: "Description" },
                  { id: "ingredients", label: "Ingredients" },
                  { id: "benefits", label: "Benefits" },
                  { id: "howtouse", label: "How to Use" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 px-2 border-b-2 transition-colors font-semibold ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  {product.description ? (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">No description available.</p>
                  )}
                </div>
              )}

              {activeTab === "ingredients" && (
                <div>
                  {product.ingredients && product.ingredients.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No ingredients listed.</p>
                  )}
                </div>
              )}

              {activeTab === "benefits" && (
                <div>
                  {product.benefits && product.benefits.length > 0 ? (
                    <ul className="space-y-3">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No benefits listed.</p>
                  )}
                </div>
              )}

              {activeTab === "howtouse" && (
                <div>
                  {product.howToUse ? (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.howToUse}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">No usage instructions available.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Warnings */}
          {product.warnings && (
            <Card className="mt-8 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Important Information
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {product.warnings}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    initialWishlisted={isWishlisted(relatedProduct.productId)}
                    onWishlistToggle={toggleWishlist}
                    onClick={(product) => {
                      router.push(`/${product.slug}`);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
