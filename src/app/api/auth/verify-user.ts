import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

interface AuthMeResponse {
  id: number;
  email: string;
  role: string;
}

export async function getCurrentUser(): Promise<AuthMeResponse | null> {
  try {
    const response = await axiosInstance.get<AuthMeResponse>("auth/verify", {
      withCredentials: true,
    });
    
    return response.data;
  } catch (error: any) {
    // If 401, user is not authenticated (cookie expired/invalid)
    if (error.response?.status === 401) {
      return null;
    }
    
    // For other errors, log and return null
    handleApiError(error);
    return null;
  }
}

