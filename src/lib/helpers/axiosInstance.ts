import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { refreshToken } from "@/app/api/auth/refresh";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for all requests
});

// Track if refresh is in progress to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use((config) => {
  // Remove skipAuth header if present (cleanup)
  if (config.headers?.skipAuth) {
    delete config.headers.skipAuth;
  }

  // Handle FormData - remove Content-Type to let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Response interceptor for handling 401 errors and automatic token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const requestUrl = originalRequest?.url || "";
        
        // Auth endpoints that should NOT trigger refresh mechanism
        const isLoginEndpoint = requestUrl.includes("/auth/login");
        const isSignupEndpoint = requestUrl.includes("/auth/signup");
        const isLogoutEndpoint = requestUrl.includes("/auth/logout");
        const isRefreshEndpoint = requestUrl.includes("/auth/refresh");
        const isVerifyEndpoint = requestUrl.includes("/auth/verify");
        
        // For login/signup endpoints, 401 is expected (wrong credentials) - just reject
        if (isLoginEndpoint || isSignupEndpoint) {
          return Promise.reject(error);
        }
        
        // ... rest of the interceptor code for other endpoints
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to handle logout
function handleLogout(currentPath: string) {
  const isAuthPage = currentPath.startsWith("/sign-in") || 
                    currentPath.startsWith("/sign-up") ||
                    currentPath.startsWith("/verify-email");
  
  const isProtectedRoute = currentPath.startsWith("/cart") || 
                          currentPath.startsWith("/dashboard") ||
                          currentPath.startsWith("/profile");

  if (!isAuthPage) {
    window.dispatchEvent(new CustomEvent("auth:logout", { 
      detail: { reason: "session_expired" } 
    }));

    if (isProtectedRoute) {
      window.location.href = "/sign-in?expired=true";
    }
  }
}

export default axiosInstance;
