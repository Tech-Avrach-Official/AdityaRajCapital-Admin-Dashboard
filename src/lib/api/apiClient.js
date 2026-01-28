import axios from "axios"

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get admin token from localStorage
    const token = localStorage.getItem("adminToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Return the full response for flexibility
    return response
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response

      if (status === 401) {
        // Unauthorized - clear tokens and redirect to login
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminId")
        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login"
        }
      }

      return Promise.reject({
        status,
        message: data?.message || "An error occurred",
        data: data,
        response: error.response,
      })
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
      })
    } else {
      // Something else happened
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
      })
    }
  }
)

export default apiClient
