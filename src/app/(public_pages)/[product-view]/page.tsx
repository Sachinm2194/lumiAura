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
  Share2, 
  Check,
  Minus,
  Plus,
  AlertCircle,
  Package,
  Truck,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import ProductCard from "@/components/core-components/product-card";
import { GetAllProducts } from "@/app/api/products";
import Breadcrumbs from "@/components/core-components/breadcrumbs";

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
        {/* Breadcrumbs - Hidden on mobile */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            ...(product.category 
              ? [{ label: product.category.name, href: `/category/${product.category.slug}` }]
              : []),
            { label: product.name }
          ]}
          showBackButton={true}
        />

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-3 md:px-8 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-3 md:space-y-4">
              {/* Main Image */}
              <div 
                className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer md:cursor-zoom-in group touch-none md:touch-auto"
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
                <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1.5 md:gap-2 z-10">
                  {product.isNew && (
                    <Badge className="bg-green-500 text-white text-xs md:text-sm px-2 py-0.5">New</Badge>
                  )}
                  {product.isFeatured && (
                    <Badge className="bg-blue-500 text-white text-xs md:text-sm px-2 py-0.5">Featured</Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs md:text-sm px-2 py-0.5">{discount}% OFF</Badge>
                  )}
                </div>

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 hover:bg-white rounded-full shadow-md h-9 w-9 md:h-10 md:w-10 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle();
                  }}
                >
                  <Heart
                    className={`h-4 w-4 md:h-5 md:w-5 transition-all ${
                      isWishlistedProduct
                        ? "fill-red-500 text-red-500"
                        : "fill-transparent text-gray-700"
                    }`}
                  />
                </Button>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 md:grid-cols-5 gap-2 md:gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all active:scale-95 ${
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/50 active:border-primary/50"
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
            <div className=" space-y-2 md:space-y-4 px-1 md:px-0">
              {/* Brand/Category */}
              {product.category && (
                <div className="text-xs md:text-sm text-muted-foreground">
                  {product.category.name}
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm md:text-base">{rating.toFixed(1)}</span>
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>

              {/* Price Section */}
              <div className="space-y-1 md:space-y-2 py-2 md:py-0">
                {selectedVariant ? (
                  <>
                    <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                      <span className="text-2xl md:text-3xl font-bold text-foreground">
                        {formatPrice(selectedVariant.sellingPrice)}
                      </span>
                      {parseFloat(selectedVariant.mrp) > parseFloat(selectedVariant.sellingPrice) && (
                        <>
                          <span className="text-lg md:text-xl text-muted-foreground line-through">
                            {formatPrice(selectedVariant.mrp)}
                          </span>
                          <Badge variant="destructive" className="text-xs md:text-sm">
                            {discount}% OFF
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Inclusive of all taxes
                    </p>
                  </>
                ) : product.variants && product.variants.length === 0 ? (
                  <div className="text-muted-foreground">
                    <p className="text-base md:text-lg">Price not available</p>
                    <p className="text-xs md:text-sm">No variants available for this product</p>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <p className="text-base md:text-lg">Loading price...</p>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm md:text-base font-semibold">
                      {product.variants.length > 1 ? "Select Size:" : "Size:"}
                    </label>
                    {selectedVariant && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        SKU: {selectedVariant.sku}
                      </span>
                    )}
                  </div>
                  {product.variants.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <Button
                          key={variant.id}
                          variant="outline"
                          onClick={() => {
                            setSelectedVariant(variant);
                            setQuantity(1); // Reset quantity when variant changes
                          }}
                          className={`min-w-[90px] md:min-w-[100px] h-10 md:h-11 text-sm md:text-base relative active:scale-95 ${
                            selectedVariant?.id === variant.id
                              ? "border-primary border-2 ring-2 ring-primary/20 bg-primary/5"
                              : ""
                          }`}
                          disabled={variant.quantity === 0}
                        >
                          {variant.variantName}
                          {variant.isDefault && (
                            <span className="ml-1 text-xs opacity-70 hidden sm:inline">(Default)</span>
                          )}
                          {variant.quantity === 0 && (
                            <span className="ml-1 text-xs opacity-70">(Out)</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    // Single variant - show as read-only
                    <div className="flex items-center gap-2 p-2.5 md:p-3 border rounded-md bg-muted/50">
                      <span className="font-medium text-sm md:text-base">{product.variants[0].variantName}</span>
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
              <div className="space-y-2 md:space-y-3">
                <label className="text-sm md:text-base font-semibold">Quantity:</label>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex items-center border-2 rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10 md:h-11 md:w-11 active:bg-muted"
                    >
                      <Minus className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <span className="px-4 md:px-6 py-2 min-w-[50px] md:min-w-[60px] text-center font-semibold text-base md:text-lg">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (selectedVariant?.quantity || 10)}
                      className="h-10 w-10 md:h-11 md:w-11 active:bg-muted"
                    >
                      <Plus className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                  {selectedVariant && (
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {selectedVariant.quantity > 0 
                        ? `${selectedVariant.quantity} available`
                        : "Out of stock"
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-3 pt-2 md:pt-0">
                <Button
                  size="lg"
                  className="flex-1 gap-2 h-12 md:h-11 text-base md:text-sm font-semibold active:scale-95"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.quantity === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2 h-12 md:h-11 text-base md:text-sm font-semibold active:scale-95"
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
              <div className="grid grid-cols-3 gap-2 md:gap-4 pt-3 md:pt-4 border-t">
                <div className="flex flex-col items-center text-center">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-primary mb-1 md:mb-2" />
                  <span className="text-[10px] md:text-xs font-semibold leading-tight">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary mb-1 md:mb-2" />
                  <span className="text-[10px] md:text-xs font-semibold leading-tight">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary mb-1 md:mb-2" />
                  <span className="text-[10px] md:text-xs font-semibold leading-tight">Easy Returns</span>
                </div>
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                className="w-full gap-2 h-11 md:h-10 text-sm md:text-sm active:scale-95"
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
          <div className="mt-8 md:mt-12 space-y-4 md:space-y-6">
            {/* Tab Navigation */}
            <div className="border-b overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
              <div className="flex gap-2 md:gap-4 min-w-max md:min-w-0">
                {[
                  { id: "description", label: "Description" },
                  { id: "ingredients", label: "Ingredients" },
                  { id: "benefits", label: "Benefits" },
                  { id: "howtouse", label: "How to Use" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2 md:pb-3 px-3 md:px-2 border-b-2 transition-colors font-semibold text-sm md:text-base whitespace-nowrap active:scale-95 ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground active:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[150px] md:min-h-[200px]">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  {product.description ? (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm md:text-base text-muted-foreground">No description available.</p>
                  )}
                </div>
              )}

              {activeTab === "ingredients" && (
                <div>
                  {product.ingredients && product.ingredients.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm md:text-base">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm md:text-base text-muted-foreground">No ingredients listed.</p>
                  )}
                </div>
              )}

              {activeTab === "benefits" && (
                <div>
                  {product.benefits && product.benefits.length > 0 ? (
                    <ul className="space-y-2 md:space-y-3">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 md:gap-3">
                          <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm md:text-base text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm md:text-base text-muted-foreground">No benefits listed.</p>
                  )}
                </div>
              )}

              {activeTab === "howtouse" && (
                <div>
                  {product.howToUse ? (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.howToUse}
                    </p>
                  ) : (
                    <p className="text-sm md:text-base text-muted-foreground">No usage instructions available.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Warnings */}
          {product.warnings && (
            <Card className="mt-6 md:mt-8 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-4 md:pt-6 px-4 md:px-6 pb-4 md:pb-6">
                <div className="flex gap-2 md:gap-3">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-amber-900 dark:text-amber-100 mb-1 md:mb-2">
                      Important Information
                    </h3>
                    <p className="text-xs md:text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      {product.warnings}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 md:mt-16">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 px-1 md:px-0">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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

      {/* <Footer /> */}
    </>
  );
}
