import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

export async function logout(): Promise<void> {
  try {
    // Call backend logout endpoint to clear cookie
    await axiosInstance.post("auth/logout", {}, {
      withCredentials: true,
    });
  } catch (error: any) {
    // Even if logout fails, we'll clear local state
    // Log error but don't throw (user should still be logged out locally)
    handleApiError(error);
  }
}

