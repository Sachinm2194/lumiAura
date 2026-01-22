import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

export async function GetWishlist() {
    try{
        const response= await axiosInstance.get("/wishlist")
        return response.data || response
    }
    catch(error){
        return handleApiError(error)
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