import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";
interface SignInPayload {
  email: string;
  password: string;
}

export async function signIn(payload: SignInPayload): Promise<any | undefined> {
  try {
    const response = await axiosInstance.post("auth/signin", {
      params: payload,
    });
    return response.data || response;
  } catch (error: any) {
    handleApiError(error);
  }
}
