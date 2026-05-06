// Auth Thunks — staff RBAC + legacy admin login fallback.

import { createAsyncThunk } from "@reduxjs/toolkit"
import { adminApiClient } from "@/modules/admin/api/client"
import { endpoints } from "@/modules/admin/api/endpoints"
import { decodeStaffToken, isStaffTokenExpired } from "@/modules/admin/lib/permissions"

const TOKEN_KEY = "adminToken"

const buildAuthPayload = (token, fallbackStaff = null) => {
  const decoded = decodeStaffToken(token)
  if (!decoded) return null

  const staff = fallbackStaff
    ? { ...fallbackStaff, ...{ id: decoded.id ?? fallbackStaff.id, email: decoded.email ?? fallbackStaff.email } }
    : { id: decoded.id, role: decoded.role, name: decoded.email, email: decoded.email }

  return {
    token,
    staff,
    role: decoded.role,
    permissions: decoded.permissions,
    scope: decoded.scope,
    tokenExp: decoded.exp,
  }
}

/**
 * Staff login — POST /api/staff/login with { email, password }.
 */
export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await adminApiClient.post(endpoints.staff.login, {
        email,
        password,
      })

      if (response.data?.success) {
        const { token, staff } = response.data.data
        const payload = buildAuthPayload(token, staff)
        if (!payload) {
          return rejectWithValue("Could not parse session token")
        }
        localStorage.setItem(TOKEN_KEY, token)
        return payload
      }

      return rejectWithValue(response.data?.message || "Login failed")
    } catch (error) {
      const code = error?.data?.error_code || error?.response?.data?.error_code
      if (code === "RATE_LIMIT_EXCEEDED" || error?.status === 429) {
        return rejectWithValue("Too many attempts; try again in 15 minutes.")
      }
      if (code === "AUTH_004" || error?.status === 401) {
        return rejectWithValue("Invalid email or password.")
      }
      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Login failed. Please try again."
      return rejectWithValue(message)
    }
  }
)

/**
 * Legacy admin login (admin_id + password) — kept behind VITE_ENABLE_LEGACY_ADMIN_LOGIN
 * for the cutover window. Will be removed once the backend retires /api/admin/login.
 */
export const loginLegacyAdmin = createAsyncThunk(
  "auth/loginLegacyAdmin",
  async ({ admin_id, password }, { rejectWithValue }) => {
    try {
      const response = await adminApiClient.post(endpoints.admin.login, {
        admin_id,
        password,
      })

      if (response.data?.success) {
        const { token } = response.data.data
        // Legacy tokens may not be JWTs in the staff format; if decode fails,
        // fall back to a minimal staff identity so the rest of the app works.
        const decoded = decodeStaffToken(token)
        const staff = decoded
          ? { id: decoded.id, role: decoded.role, name: decoded.email, email: decoded.email }
          : { id: response.data.data.admin_id, role: "super_admin", name: "Admin", email: null }
        const payload = {
          token,
          staff,
          role: staff.role,
          permissions: decoded?.permissions || ["*"],
          scope: decoded?.scope || { nations: [], states: [], branches: [] },
          tokenExp: decoded?.exp ?? null,
        }
        localStorage.setItem(TOKEN_KEY, token)
        return payload
      }

      return rejectWithValue(response.data?.message || "Login failed")
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Login failed. Please try again."
      return rejectWithValue(message)
    }
  }
)

/**
 * Logout — clear token + Redux state.
 */
export const logoutAdmin = createAsyncThunk(
  "auth/logoutAdmin",
  async () => {
    localStorage.removeItem(TOKEN_KEY)
    return true
  }
)

/**
 * Re-hydrate auth state from localStorage on app load. Rejects if no token,
 * the token cannot be decoded, or the token has expired.
 */
export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      return rejectWithValue("No auth token found")
    }

    const payload = buildAuthPayload(token)
    if (!payload) {
      localStorage.removeItem(TOKEN_KEY)
      return rejectWithValue("Invalid token")
    }

    if (payload.tokenExp && isStaffTokenExpired(payload.tokenExp)) {
      localStorage.removeItem(TOKEN_KEY)
      return rejectWithValue("Token expired")
    }

    return payload
  }
)
