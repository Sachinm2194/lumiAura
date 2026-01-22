"use client";

import { useParams } from "next/navigation";
import ProductDetailView from "@/components/core-components/product-detail-view";

export default function CategoryProductPage() {
  const params = useParams();
  const productSlug = params?.["product-slug"] as string;
  const categorySlug = params?.["category-slug"] as string;

  if (!productSlug) {
    return null;
  }

  // Use the same ProductDetailView component
  // This will work for product slugs accessed via /categories/[category-slug]/[product-slug]
  return (
    <ProductDetailView 
      slug={productSlug}
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Categories", href: "/categories" },
        ...(categorySlug ? [{ label: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, " "), href: `/categories/${categorySlug}` }] : []),
      ]}
    />
  );
}

