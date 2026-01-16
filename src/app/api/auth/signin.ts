import axiosInstance from "@/lib/helpers/axiosInstance";
import { handleApiError } from "@/lib/helpers/handleApiError";

interface SignInPayload {
  email: string;
  password: string;
}

interface SignInResponse {
  message: string;
  id: number;
  email: string;
  role: string;
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse | undefined> {
  try {
    const response = await axiosInstance.post<SignInResponse>("auth/login", payload, {
      headers: { skipAuth: true },
      withCredentials: true,
    });
   
    return response.data;
  } catch (error: any) {
    handleApiError(error);
    throw error; // Re-throw to let form handle it
  }
}
