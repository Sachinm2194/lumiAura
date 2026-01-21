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