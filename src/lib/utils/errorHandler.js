/**
 * API Error Handler Utility
 * Centralized error handling for API calls
 */

import toast from "react-hot-toast"

/**
 * Handle API errors and show appropriate toast messages
 * @param {Error|Object} error - The error object from API call
 * @param {string} defaultMessage - Default message to show if no specific message
 * @returns {string} - The error message
 */
export const handleApiError = (error, defaultMessage = "An error occurred") => {
  const status = error?.response?.status || error?.status
  const message = error?.response?.data?.message || error?.message

  let errorMessage = defaultMessage

  switch (status) {
    case 400:
      // Bad request - show server message
      errorMessage = message || "Invalid request. Please check your input."
      break
    case 401:
      // Unauthorized - handled by interceptor, but just in case
      errorMessage = "Session expired. Please login again."
      break
    case 403:
      errorMessage = "You do not have permission to perform this action."
      break
    case 404:
      errorMessage = message || "Resource not found."
      break
    case 409:
      errorMessage = message || "Conflict - resource already exists."
      break
    case 422:
      errorMessage = message || "Validation error. Please check your input."
      break
    case 500:
      errorMessage = "Server error. Please try again later."
      break
    default:
      errorMessage = message || defaultMessage
  }

  // Show toast notification
  toast.error(errorMessage)

  return errorMessage
}

/**
 * Extract validation errors from API response
 * @param {Object} error - The error object
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export const getValidationErrors = (error) => {
  const errors = error?.response?.data?.errors || error?.data?.errors
  if (!errors) return {}

  // Convert array of errors to object format if needed
  if (Array.isArray(errors)) {
    return errors.reduce((acc, err) => {
      if (err.field) {
        acc[err.field] = err.message
      }
      return acc
    }, {})
  }

  return errors
}

export default handleApiError
