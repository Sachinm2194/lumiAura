import axiosInstance from "@/lib/helpers/axiosInstance";

interface AddProductToCartPayload {
  productId: string;
  quantity?: number;
  variantId?: string;
}

/**
 * Fetch cart items with optional search
 * @param search - Optional search query to filter cart items
 */
export async function getCart(search?: string) {
  const params: { search?: string } = {};
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const response = await axiosInstance.get("/cart", { params });
  return response.data || response || [];
}

/**
 * Add a product to cart
 * @param product - Product with productId (and optional quantity/variantId)
 */
export async function addToCart(product: AddProductToCartPayload) {
  const response = await axiosInstance.post("/cart/add", {
    productId: product.productId,
    ...(product.quantity && { quantity: product.quantity }),
    ...(product.variantId && { variantId: product.variantId }),
  });
  return response.data || response;
}

export async function updateCartItem(
  productId: string,
  updates: { quantity: number; variantId: number },
) {
  {
    const response = await axiosInstance.post(`/cart/update/${productId}`, {
      ...updates,
    });
    return response.data || response;
  }
}

export async function removeFromCart(productIds: string[]) {
  const response = await axiosInstance.post(`/cart/remove`, {
    productIds: productIds,
  });
  return response.data || response;
}
