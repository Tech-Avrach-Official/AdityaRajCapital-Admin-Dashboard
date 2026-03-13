// Auth Thunks - Async actions for authentication
// Handles API calls for login, logout, and auth verification

import { createAsyncThunk } from "@reduxjs/toolkit"
import { adminApiClient } from "@/modules/admin/api/client"
import { endpoints } from "@/modules/admin/api/endpoints"

/**
 * Login Admin
 * Authenticates admin user and stores token
 */
export const loginAdmin = createAsyncThunk(
  "auth/loginRM",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await RMApiClient.post(endpoints.admin.login, {
        email,
        password,
      })
      
      if (response.data?.success) {
        const { token, rm_id: rmId } = response.data.data
        
        // Store in localStorage for persistence
        localStorage.setItem("RMToken", token)
        localStorage.setItem("RMId", rmId)
        
        return {
          token,
          admin_id: rmId,
        }
      }
      
      return rejectWithValue(response.data?.message || "Login failed")
    } catch (error) {
      const message = error.response?.data?.message || "Login failed. Please try again."
      return rejectWithValue(message)
    }
  }
)

/**
 * Logout Admin
 * Clears auth state and localStorage
 */
export const logoutAdmin = createAsyncThunk(
  "auth/logoutRM",
  async (_, { dispatch }) => {
    // Clear localStorage
    localStorage.removeItem("RMToken")
    localStorage.removeItem("RMId")
    
    // Optionally call logout API if needed
    // await apiClient.post(endpoints.admin.logout)
    
    return true
  }
)

/**
 * Check Auth Status
 * Verifies if user is authenticated on app load
 * Rehydrates auth state from localStorage
 */
export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken")
      const adminId = localStorage.getItem("adminId")
      
      if (!token || !adminId) {
        return rejectWithValue("No auth token found")
      }
      
      // Optionally verify token with backend
      // const response = await apiClient.get(endpoints.admin.verify)
      // if (!response.data?.success) {
      //   localStorage.removeItem("adminToken")
      //   localStorage.removeItem("adminId")
      //   return rejectWithValue("Invalid token")
      // }
      
      return {
        token,
        adminId,
      }
    } catch (error) {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminId")
      return rejectWithValue("Auth check failed")
    }
  }
)
