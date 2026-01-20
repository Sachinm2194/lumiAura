import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

export async function GetAllProducts() {
  try {
    const response = await axiosInstance.get(`/products`);
    console.log(response.data);
    return response.data || response;
  } catch (error) {
    handleApiError(error);
  }
}
