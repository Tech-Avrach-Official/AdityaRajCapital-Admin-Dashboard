// Auth Thunks - Async actions for authentication
// Handles API calls for login, logout, and auth verification

import { createAsyncThunk } from "@reduxjs/toolkit"
import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"

/**
 * Login Admin
 * Authenticates admin user and stores token
 */
export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async ({ admin_id, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(endpoints.admin.login, {
        admin_id,
        password,
      })
      
      if (response.data?.success) {
        const { token, admin_id: adminId } = response.data.data
        
        // Store in localStorage for persistence
        localStorage.setItem("adminToken", token)
        localStorage.setItem("adminId", adminId)
        
        return {
          token,
          admin_id: adminId,
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
  "auth/logoutAdmin",
  async (_, { dispatch }) => {
    // Clear localStorage
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminId")
    
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
