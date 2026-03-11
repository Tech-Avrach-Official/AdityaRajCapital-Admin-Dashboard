// Error Middleware - Centralized error handling for Redux thunks
// 401 is handled by each module's apiClient (createApiClient); this only shows toasts.

import toast from "react-hot-toast"

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

const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.response?.status) return ERROR_MESSAGES[error.response.status] || ERROR_MESSAGES.default
  if (error?.message === "Network Error") return "Network error. Please check your connection."
  if (typeof error === "string") return error
  if (error?.message) return error.message
  return ERROR_MESSAGES.default
}

const SILENT_ACTIONS = [
  "auth/checkAuthStatus/rejected",
  "rms/validateRMCode/rejected",
]

export const errorMiddleware = (store) => (next) => (action) => {
  if (action.type?.endsWith("/rejected")) {
    const error = action.payload || action.error
    if (import.meta.env.DEV) {
      console.error(`Redux Error [${action.type}]:`, error)
    }
    if (SILENT_ACTIONS.includes(action.type)) {
      return next(action)
    }
    // 401: handled by each module's apiClient interceptor; do not clear storage or redirect here
    const errorMessage = getErrorMessage(error)
    toast.error(errorMessage)
  }
  return next(action)
}

export default errorMiddleware
