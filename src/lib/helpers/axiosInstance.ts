import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for all requests
});

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

// Response interceptor for handling 401 errors (Session Expiration)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid cookie
      // Only handle if not already on login/signup page
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.startsWith("/sign-in") || 
                          currentPath.startsWith("/sign-up") ||
                          currentPath.startsWith("/verify-email");

        if (!isAuthPage) {
          // Clear auth state (will be handled by context)
          // Dispatch custom event to notify auth context
          window.dispatchEvent(new CustomEvent("auth:logout", { 
            detail: { reason: "session_expired" } 
          }));

          // Redirect to login with message
          window.location.href = "/sign-in?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
