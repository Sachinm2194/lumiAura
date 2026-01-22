"use client";

import { useParams } from "next/navigation";
import ProductDetailView from "@/components/core-components/product-detail-view";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.["product-view"] as string;

  if (!slug) {
    return null;
  }

  return <ProductDetailView slug={slug} />;
}
