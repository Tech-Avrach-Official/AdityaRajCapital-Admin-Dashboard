import axios from "axios"

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("authToken")
        window.location.href = "/login"
      }
      
      return Promise.reject({
        status,
        message: data?.message || "An error occurred",
        data: data,
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
