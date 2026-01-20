// Product Variant Type
export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  variantName: string;
  mrp: string;
  sellingPrice: string;
  quantity: number;
  isDefault: boolean;
  createdAt: string;
}

// Category Type
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Product Image Type
export interface ProductImage {
  id?: number;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

// Product Tag Type
export interface ProductTag {
  id?: number;
  name: string;
  slug?: string;
}

// Main Product Type
export interface Product {
  id: number;
  productId: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  ingredients: string[];
  benefits: string[];
  howToUse: string | null;
  warnings: string | null;
  skinType: string[];
  concerns: string[] | null;
  suitableFor: string[] | null;
  averageRating: string;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  status: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  tags: ProductTag[];
}

// Product Card Props (for display purposes)
export interface ProductCardProps {
  product: Product;
  className?: string;
  onClick?: (product: Product) => void;
  isAd?: boolean; // Show "AD" badge
  onWishlistToggle?: (product: Product, isWishlisted: boolean) => void;
  initialWishlisted?: boolean; // Sync with backend wishlist state
}

