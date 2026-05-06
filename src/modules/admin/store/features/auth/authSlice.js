// Auth Slice — staff RBAC state
// Holds the decoded staff identity, permissions, and scope from the JWT.

import { createSlice } from "@reduxjs/toolkit"
import { loginAdmin, loginLegacyAdmin, logoutAdmin, checkAuthStatus } from "./authThunks"

const initialState = {
  staff: null, // { id, role, name, email }
  role: null,
  permissions: [],
  scope: { nations: [], states: [], branches: [] },
  token: null,
  tokenExp: null,
  isAuthenticated: false,
  loading: false,
  checkingAuth: true,
  error: null,
}

const applyAuth = (state, payload) => {
  state.loading = false
  state.checkingAuth = false
  state.isAuthenticated = true
  state.staff = payload.staff
  state.role = payload.role
  state.permissions = payload.permissions || []
  state.scope = payload.scope || { nations: [], states: [], branches: [] }
  state.token = payload.token
  state.tokenExp = payload.tokenExp ?? null
  state.error = null
}

const clearAuth = (state) => {
  state.staff = null
  state.role = null
  state.permissions = []
  state.scope = { nations: [], states: [], branches: [] }
  state.token = null
  state.tokenExp = null
  state.isAuthenticated = false
  state.loading = false
  state.error = null
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    setAuthCheckComplete: (state) => {
      state.checkingAuth = false
    },
    resetAuth: () => initialState,
    // Used by My Profile save to refresh the in-memory staff name/email/mobile.
    setStaffProfile: (state, action) => {
      if (state.staff) {
        state.staff = { ...state.staff, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        applyAuth(state, action.payload)
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        clearAuth(state)
        state.checkingAuth = false
        state.error = action.payload || "Login failed"
      })

    builder
      .addCase(loginLegacyAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginLegacyAdmin.fulfilled, (state, action) => {
        applyAuth(state, action.payload)
      })
      .addCase(loginLegacyAdmin.rejected, (state, action) => {
        clearAuth(state)
        state.checkingAuth = false
        state.error = action.payload || "Login failed"
      })

    builder.addCase(logoutAdmin.fulfilled, (state) => {
      clearAuth(state)
      state.checkingAuth = false
    })

    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.checkingAuth = true
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          applyAuth(state, action.payload)
        } else {
          clearAuth(state)
          state.checkingAuth = false
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        clearAuth(state)
        state.checkingAuth = false
      })
  },
})

export const { clearAuthError, setAuthCheckComplete, resetAuth, setStaffProfile } =
  authSlice.actions

export default authSlice.reducer
