import axiosInstance from "@/lib/helpers/axiosInstance";

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
console.log("payload", payload);
  const response = await axiosInstance.post<SignInResponse>("auth/login", payload, {
    headers: { skipAuth: true },
    withCredentials: true,
  });
  return response.data;

}
