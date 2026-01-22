"use client";

import { useParams } from "next/navigation";
import ProductDetailView from "@/components/core-components/product-detail-view";

export default function CategoryProductDetailPage() {
  const params = useParams();
  const productSlug = params?.["product-slug"] as string;
  const categorySlug = params?.["category-slug"] as string;

  if (!productSlug) {
    return null;
  }

  // Format category name for breadcrumb (capitalize and replace hyphens)
  const formatCategoryName = (slug: string) => {
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Use the same ProductDetailView component
  // This will work for product slugs accessed via /category/[category-slug]/[product-slug]
  return (
    <ProductDetailView 
      slug={productSlug}
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Categories", href: "/categories" },
        ...(categorySlug ? [
          { 
            label: formatCategoryName(categorySlug), 
            href: `/category/${categorySlug}` 
          }
        ] : []),
      ]}
    />
  );
}

