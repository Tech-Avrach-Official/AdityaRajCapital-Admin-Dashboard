import axios from "axios"

/**
 * Factory to create an axios instance bound to a module's auth (token key, login path).
 * Used for Option B: separate auth per module. Each module gets its own client.
 *
 * @param {Object} config
 * @param {string} config.tokenKey - localStorage key for the JWT (e.g. 'adminToken', 'rmToken')
 * @param {string} config.loginPath - Path to redirect on 401 (e.g. '/admin/login', '/rm/login')
 * @param {string[]} [config.keysToClearOn401] - Keys to clear from localStorage on 401
 * @param {string} [config.baseURL] - API base URL (defaults to VITE_API_BASE_URL)
 * @returns {import('axios').AxiosInstance}
 */
export function createApiClient({ tokenKey, loginPath, keysToClearOn401 = [], baseURL }) {
  const instance = axios.create({
    baseURL: baseURL ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(tokenKey)
      if (token) { 
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const keysToClear = keysToClearOn401.length ? keysToClearOn401 : [tokenKey]
        keysToClear.forEach((key) => localStorage.removeItem(key))
        if (!window.location.pathname.includes(loginPath)) {
          window.location.href = loginPath
        }
      }

      if (error.response) {
        const { status, data } = error.response
        return Promise.reject({
          status,
          message: data?.message || "An error occurred",
          data,
          response: error.response,
        })
      }
      if (error.request) {
        return Promise.reject({
          status: 0,
          message: "Network error. Please check your connection.",
        })
      }
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
      })
    }
  )

  return instance
}
