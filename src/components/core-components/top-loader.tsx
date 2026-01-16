"use client"

import NextTopLoader from "nextjs-toploader";

export default function TopLoader() {
  // Use primary color from CSS variables (#F8981D)
  return <NextTopLoader showSpinner={false} color="#F8981D" />;
}

