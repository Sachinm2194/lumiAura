import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

export async function emailVerify(token: string): Promise<string | undefined> {
    try {
      const response = await axiosInstance.get(
      'auth/verify-email',{params: {token}}
      );
      return response.data || response ;
    } catch (error: any) {
      handleApiError(error);
    }
  }