// Auth Slice - Authentication state management
// Handles login, logout, and auth state persistence

import { createSlice } from "@reduxjs/toolkit"
import { loginAdmin, logoutAdmin, checkAuthStatus } from "./authThunks"

/**
 * Initial auth state
 */
const initialState = {
  // User information
  user: null,
  adminId: null,
  
  // JWT token
  token: null,
  
  // Auth status
  isAuthenticated: false,
  
  // Loading states
  loading: false,
  checkingAuth: true, // True on initial load while checking localStorage
  
  // Error state
  error: null,
}

/**
 * Auth Slice
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear error
    clearAuthError: (state) => {
      state.error = null
    },
    
    // Set auth checking complete
    setAuthCheckComplete: (state) => {
      state.checkingAuth = false
    },
    
    // Reset auth state
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    // ============ Login ============
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.adminId = action.payload.admin_id
        state.user = { admin_id: action.payload.admin_id }
        state.error = null
        state.checkingAuth = false
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.token = null
        state.adminId = null
        state.user = null
        state.error = action.payload || "Login failed"
        state.checkingAuth = false
      })
    
    // ============ Logout ============
    builder
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false
        state.token = null
        state.adminId = null
        state.user = null
        state.error = null
        state.loading = false
      })
    
    // ============ Check Auth Status ============
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.checkingAuth = true
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.checkingAuth = false
        if (action.payload) {
          state.isAuthenticated = true
          state.token = action.payload.token
          state.adminId = action.payload.adminId
          state.user = { admin_id: action.payload.adminId }
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.checkingAuth = false
        state.isAuthenticated = false
        state.token = null
        state.adminId = null
        state.user = null
      })
  },
})

// Export actions
export const { clearAuthError, setAuthCheckComplete, resetAuth } = authSlice.actions

// Export reducer
export default authSlice.reducer
