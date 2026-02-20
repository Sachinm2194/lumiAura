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
  // Log the full URL being requested for debugging
  const fullUrl = `${config.baseURL}${config.url}${config.params ? '?' + new URLSearchParams(config.params).toString() : ''}`;
  
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
        const currentPath = window.location.pathname;
        const requestUrl = originalRequest?.url || "";
        
        // Check if we're on an auth page (sign-in/sign-up)
        // If so, skip ALL refresh logic - 401s are expected during login attempts
        const isAuthPage = currentPath.startsWith("/sign-in") || 
                          currentPath.startsWith("/sign-up") ||
                          currentPath.startsWith("/verify-email");
        
        // Auth endpoints that should NOT trigger refresh mechanism
        const isLoginEndpoint = requestUrl.includes("/auth/login");
        const isSignupEndpoint = requestUrl.includes("/auth/register") || requestUrl.includes("/auth/signup");
        const isLogoutEndpoint = requestUrl.includes("/auth/logout");
        const isRefreshEndpoint = requestUrl.includes("/auth/refresh");
        const isVerifyEndpoint = requestUrl.includes("/auth/verify");
        
        // CRITICAL: If on auth page, reject ALL 401s immediately without refresh
        // This prevents background auth checks from interfering with login attempts
        if (isAuthPage) {
          return Promise.reject(error);
        }
        
        // For login/signup endpoints, 401 is expected (wrong credentials) - just reject
        if (isLoginEndpoint || isSignupEndpoint) {
          return Promise.reject(error);
        }
        
        // For logout endpoint, don't refresh - just reject
        if (isLogoutEndpoint) {
          return Promise.reject(error);
        }
        
        // For refresh endpoint, if it returns 401, refresh token is invalid - logout
        if (isRefreshEndpoint) {
          handleLogout(currentPath);
          return Promise.reject(error);
        }
        
        // For verify endpoint, getCurrentUser() handles refresh manually - just reject
        // This prevents double refresh attempts
        if (isVerifyEndpoint) {
          return Promise.reject(error);
        }
        
        // For all other endpoints (including /auth/verify-email and all protected APIs), try to refresh token on 401
        if (!originalRequest._retry) {
          if (isRefreshing) {
            // If refresh is already in progress, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Call refresh token API
            const refreshResult = await refreshToken();
            
            if (refreshResult) {
              // Refresh successful - retry original request
              processQueue(null, null);
              return axiosInstance(originalRequest);
            } else {
              // Refresh failed - user needs to login
              processQueue(error, null);
              handleLogout(currentPath);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Refresh failed - clear queue and logout
            processQueue(error, null);
            handleLogout(currentPath);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
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
