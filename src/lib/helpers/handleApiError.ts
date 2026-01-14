import { toast } from "sonner";

// Store shown error messages to prevent duplicates
const shownErrors = new Set<string>();

function showToastOnce(message: string, type: 'error' | 'warning' | 'info' = 'error') {
  if (shownErrors.has(message)) return;
  shownErrors.add(message);
  toast[type](message);
  setTimeout(() => shownErrors.delete(message), 3000); // Clear after 3 sec
}

export function handleApiError(error: any): never {
  // Check for array-related errors (data.map is not a function)
  if (error.message && error.message.includes('data.map is not a function')) {
    console.warn('Array data error handled silently:', error.message);
    // Don't show toast for array errors, just log and throw silently
    throw new Error('No data available');
  }

  // Check for other array-related errors
  if (error.message && (
    error.message.includes('map is not a function') ||
    error.message.includes('Cannot read properties') ||
    error.message.includes('is not iterable')
  )) {
    console.warn('Data structure error handled silently:', error.message);
    throw new Error('No data available');
  }

  // Axios network error (no response)
  if (error.isAxiosError && !error.response) {
    showToastOnce("Network error: Unable to reach the server. Please check your connection.", 'warning');
    throw new Error("Network error: Unable to reach the server. Please check your connection.");
  }

  // HTTP error with response
  if (error.response) {
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Server error: ${error.response.statusText || "Unknown error"}`;
    showToastOnce(message, 'error');
    throw new Error(message);
  }

  // Timeout
  if (error.code === "ECONNABORTED") {
    showToastOnce("Request timed out. Please try again later.", 'error');
    throw new Error("Request timed out. Please try again later.");
  }

  // Validation error or custom error
  if (error.message) {
    showToastOnce(error.message, 'error');
    throw new Error(error.message);
  }

  // Fallback for unknown errors
  showToastOnce("An unexpected error occurred. Please try again.", 'error');
  throw new Error("An unexpected error occurred. Please try again.");
}
