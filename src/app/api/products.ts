import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

export async function GetAllProducts(search?: string) {
  try {
    console.log("=== GET ALL PRODUCTS START ===");
    console.log("GetAllProducts called with search:", search);
    console.log("Search type:", typeof search);
    console.log("Search is undefined:", search === undefined);
    console.log("Search is empty string:", search === "");
    
    // Only add search param if search is provided and not empty
    const params: { search?: string } = {};
    console.log("Initial params:", params);
    
    if (search && search.trim()) {
      params.search = search.trim();
      console.log("Adding search param:", params.search);
    } else {
      console.log("No search param added (search is empty or undefined)");
    }
    
    console.log("Final params object:", params);
    
    const response = await axiosInstance.get(`/products`, { params });
    console.log("API response received, data length:", response.data?.length || 0);
    console.log("=== GET ALL PRODUCTS END ===");
    
    return response.data || response;
  } catch (error) {
    console.error("GetAllProducts error:", error);
    handleApiError(error);
  }
}

export async function GetProductBySlug(slug: string) {
  try {
    // Backend supports smart routing - just pass the slug directly
    const response = await axiosInstance.get(`/products/${slug}`);
    return response.data || response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}