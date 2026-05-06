// Error Middleware - Centralized error handling for Redux thunks
// 401 redirect is owned by each module's apiClient (createApiClient).
// This middleware only surfaces toasts. 403 (forbidden) is treated as a
// permission error — show server message, do NOT clear storage or redirect.

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

const getStatus = (error) =>
  error?.status ?? error?.response?.status ?? null

const getServerMessage = (error) =>
  error?.data?.message ??
  error?.response?.data?.message ??
  null

const getErrorMessage = (error) => {
  const status = getStatus(error)
  const serverMessage = getServerMessage(error)

  // 403: prefer the server's explanation (e.g. "Cannot place state_head in
  // branch 99: outside your scope") so the user can act on it.
  if (status === 403) {
    return serverMessage || ERROR_MESSAGES[403]
  }

  if (serverMessage) return serverMessage
  if (status && ERROR_MESSAGES[status]) return ERROR_MESSAGES[status]
  if (error?.message === "Network Error") {
    return "Network error. Please check your connection."
  }
  if (typeof error === "string") return error
  if (error?.message) return error.message
  return ERROR_MESSAGES.default
}

const SILENT_ACTIONS = [
  "auth/checkAuthStatus/rejected",
  "rms/validateRMCode/rejected",
]

export const errorMiddleware = () => (next) => (action) => {
  if (action.type?.endsWith("/rejected")) {
    const error = action.payload || action.error
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`Redux Error [${action.type}]:`, error)
    }
    if (SILENT_ACTIONS.includes(action.type)) {
      return next(action)
    }
    // 401 redirect: handled by createApiClient interceptor — middleware just toasts.
    // 403: show the server message; do NOT touch storage or redirect.
    const errorMessage = getErrorMessage(error)
    toast.error(errorMessage)
  }
  return next(action)
}

export default errorMiddleware
