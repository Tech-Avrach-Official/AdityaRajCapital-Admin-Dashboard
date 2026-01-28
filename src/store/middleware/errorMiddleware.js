// Error Middleware - Centralized error handling for Redux thunks
// Catches rejected async thunks and displays toast notifications

import toast from "react-hot-toast"

/**
 * Error messages for different HTTP status codes
 */
const ERROR_MESSAGES = {
  400: "Invalid request. Please check your input.",
  401: "Session expired. Please login again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "Conflict - this resource already exists.",
  422: "Validation failed. Please check your input.",
  500: "Server error. Please try again later.",
  default: "An unexpected error occurred.",
}

/**
 * Extract error message from error object
 */
const getErrorMessage = (error) => {
  // API error with response
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  // API error with status code
  if (error?.response?.status) {
    return ERROR_MESSAGES[error.response.status] || ERROR_MESSAGES.default
  }
  
  // Network error
  if (error?.message === "Network Error") {
    return "Network error. Please check your connection."
  }
  
  // String error
  if (typeof error === "string") {
    return error
  }
  
  // Error object with message
  if (error?.message) {
    return error.message
  }
  
  return ERROR_MESSAGES.default
}

/**
 * Actions that should not trigger error toasts
 * (e.g., validation checks, silent failures)
 */
const SILENT_ACTIONS = [
  "auth/checkAuthStatus/rejected", // Silent auth check on app load
  "rms/validateRMCode/rejected",   // Validation feedback shown in form
]

/**
 * Error Middleware
 * 
 * Intercepts rejected async thunks and:
 * 1. Logs errors to console in development
 * 2. Shows toast notifications to user
 * 3. Handles special cases (401 redirects, etc.)
 */
export const errorMiddleware = (store) => (next) => (action) => {
  // Check if this is a rejected async thunk
  if (action.type?.endsWith("/rejected")) {
    const error = action.payload || action.error
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`Redux Error [${action.type}]:`, error)
    }
    
    // Skip silent actions
    if (SILENT_ACTIONS.includes(action.type)) {
      return next(action)
    }
    
    // Handle 401 Unauthorized - redirect to login
    if (error?.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminId")
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        toast.error("Session expired. Please login again.")
        window.location.href = "/admin/login"
      }
      return next(action)
    }
    
    // Show error toast for other errors
    const errorMessage = getErrorMessage(error)
    toast.error(errorMessage)
  }
  
  return next(action)
}

export default errorMiddleware
