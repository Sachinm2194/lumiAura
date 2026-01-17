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
          timeout: 2000, // 2 second timeout (reduced for faster response) to prevent hanging
    });
    
    return response.data;
  } catch (error: any) {
    // If refresh fails (401 or any error), user needs to login again
    // Don't log 401 errors as they're expected when refresh token is invalid
    if (error.response?.status !== 401) {
      handleApiError(error);
    }
    return null;
  }
}

