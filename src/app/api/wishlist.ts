import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

export async function GetWishlist(search?: string) {
    try {
       
        
        // Only add search param if search is provided and not empty
        const params: { search?: string } = {};
        if (search && search.trim()) {
            params.search = search.trim();
            console.log("Adding search param:", params.search);
        } else {
            console.log("No search param added (search is empty or undefined)");
        }
        
        console.log("Final params object:", params);
        console.log("Params keys length:", Object.keys(params).length);
        console.log("Expected URL:", `${process.env.NEXT_PUBLIC_BASE_URL}/wishlist${Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : ''}`);
        
        // Additional verification
        if (Object.keys(params).length > 0) {
            console.log("✅ SEARCH PARAM WILL BE SENT");
        } else {
            console.log("ℹ️ NO SEARCH PARAM (FETCHING ALL ITEMS)");
        }
        
        const response = await axiosInstance.get("/wishlist", { params });
        console.log("Wishlist API response received, data length:", response.data?.length || 0);
        console.log("=== GET WISHLIST END ===");
        
        return response.data || response;
    } catch (error) {
        console.error("GetWishlist error:", error);
        return handleApiError(error);
    }
}

export async function AddToWishlist(productId: string) {
    try{
        const response= await axiosInstance.post("/wishlist/add", { productId })
        return response.data || response
    }
    catch(error){
        return handleApiError(error)
    }
}

export async function RemoveFromWishlist(productId: string) {
    try{
        const response= await axiosInstance.delete(`/wishlist/remove/${productId}`)
        return response.data || response
    }
    catch(error){
        return handleApiError(error)
    }
}