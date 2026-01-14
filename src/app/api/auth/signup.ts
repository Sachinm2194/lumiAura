import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

interface SignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export async function signUp(payload: SignUpPayload): Promise<any | undefined> {
  try {
    const response = await axiosInstance.post("auth/register", payload);
    return response.data || response;
  } catch (error: any) {
    handleApiError(error);
  }
}
