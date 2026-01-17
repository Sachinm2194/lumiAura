import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

interface AuthMeResponse {
  id: number;
  email: string;
  role: string;
}

export async function getCurrentUser(): Promise<AuthMeResponse | null> {
  try {
    console.log("[getCurrentUser] Calling auth/verify endpoint");
    const response = await axiosInstance.get<AuthMeResponse>("auth/verify", {
      withCredentials: true,
      timeout: 3000, // 3 second timeout to prevent hanging
    });
    
    console.log("[getCurrentUser] Success, user data:", response.data);
    return response.data;
  } catch (error: any) {
    console.log("[getCurrentUser] Error:", error.response?.status || error.message);
    
    // If 401, user is not authenticated (cookie expired/invalid)
    if (error.response?.status === 401) {
      console.log("[getCurrentUser] 401 - User not authenticated");
      return null;
    }
    
    // For timeout or network errors, silently return null
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout") || !error.response) {
      console.log("[getCurrentUser] Timeout or network error - assuming not authenticated");
      return null;
    }
    
    // For other errors, log and return null
    handleApiError(error);
    return null;
  }
}

