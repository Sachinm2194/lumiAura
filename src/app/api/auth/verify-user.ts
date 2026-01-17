import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";
import { refreshToken } from "@/app/api/auth/refresh";

interface AuthMeResponse {
  authenticated: boolean;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export async function getCurrentUser(): Promise<{ id: number; email: string; role: string } | null> {
  try {
    const response = await axiosInstance.get<AuthMeResponse>("auth/verify", {
      withCredentials: true,
      timeout: 2000, // Reduced from 3s to 2s for faster response
    });
    
    // Check if response has authenticated and user properties
    if (response.data?.authenticated && response.data?.user) {
      return response.data.user;
    }
    
    return null;
  } catch (error: any) {
    // If 401, try to refresh token and retry
    if (error.response?.status === 401) {
      try {
        // Attempt to refresh token (with 3-second timeout)
        const refreshResult = await refreshToken();
        
        // If refresh returns null, it means refresh failed (401 or other error)
        // Return null immediately - no need to retry verify
        if (!refreshResult) {
          return null;
        }
        
        // Refresh successful - retry the verify call
        try {
          const retryResponse = await axiosInstance.get<AuthMeResponse>("auth/verify", {
            withCredentials: true,
            timeout: 2000, // Reduced from 3s to 2s for faster response
          });
          
          if (retryResponse.data?.authenticated && retryResponse.data?.user) {
            return retryResponse.data.user;
          }
          
          // Retry verify didn't return user data
          return null;
        } catch (retryError: any) {
          // Retry failed - user is not authenticated
          return null;
        }
      } catch (refreshError: any) {
        // Refresh call failed - user is not authenticated
        return null;
      }
    }
    
    // For timeout or network errors, silently return null
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout") || !error.response) {
      return null;
    }
    
    // For other errors, log and return null
    handleApiError(error);
    return null;
  }
}