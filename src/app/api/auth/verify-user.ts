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
      timeout: 5000, // Increased to 5s to allow for slower networks
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
        // Attempt to refresh token
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
            timeout: 5000, // Increased to 5s to allow for slower networks
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
    // Don't log these as they're common during initial load
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout") || !error.response) {
      return null;
    }
    
    // For other errors, log and return null
    handleApiError(error);
    return null;
  }
}