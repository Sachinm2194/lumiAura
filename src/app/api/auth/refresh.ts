import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

interface RefreshResponse {
  message?: string;
  // Backend might return new token or just success
}

export async function refreshToken(): Promise<RefreshResponse | null> {
  try {
    // Call backend refresh endpoint - refresh token is sent automatically via cookie
    const response = await axiosInstance.post<RefreshResponse>("auth/refresh", {}, {
      withCredentials: true,
    });
    
    return response.data;
  } catch (error: any) {
    // If refresh fails, user needs to login again
    handleApiError(error);
    return null;
  }
}

