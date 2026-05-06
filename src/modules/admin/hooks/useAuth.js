// useAuth — staff RBAC hook for the admin module.

import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  selectIsAuthenticated,
  selectStaff,
  selectStaffId,
  selectRole,
  selectIsSuperAdmin,
  selectPermissions,
  selectScope,
  selectAuthLoading,
  selectAuthChecking,
  selectAuthError,
  selectAuthStatus,
  selectAuthToken,
  selectTokenExp,
} from "@/modules/admin/store/features/auth/authSelectors"
import {
  loginAdmin,
  loginLegacyAdmin,
  logoutAdmin,
  checkAuthStatus,
} from "@/modules/admin/store/features/auth/authThunks"
import { clearAuthError } from "@/modules/admin/store/features/auth/authSlice"

export const useAuth = () => {
  const dispatch = useAppDispatch()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const staff = useAppSelector(selectStaff)
  const staffId = useAppSelector(selectStaffId)
  const role = useAppSelector(selectRole)
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin)
  const permissions = useAppSelector(selectPermissions)
  const scope = useAppSelector(selectScope)
  const token = useAppSelector(selectAuthToken)
  const tokenExp = useAppSelector(selectTokenExp)
  const loading = useAppSelector(selectAuthLoading)
  const checking = useAppSelector(selectAuthChecking)
  const error = useAppSelector(selectAuthError)
  const authStatus = useAppSelector(selectAuthStatus)

  const login = useCallback(
    async (credentials) => dispatch(loginAdmin(credentials)),
    [dispatch]
  )

  const loginLegacy = useCallback(
    async (credentials) => dispatch(loginLegacyAdmin(credentials)),
    [dispatch]
  )

  const logout = useCallback(async () => dispatch(logoutAdmin()), [dispatch])

  const checkAuth = useCallback(async () => dispatch(checkAuthStatus()), [
    dispatch,
  ])

  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch])

  return {
    isAuthenticated,
    staff,
    staffId,
    role,
    isSuperAdmin,
    permissions,
    scope,
    token,
    tokenExp,
    loading,
    checking,
    error,
    authStatus,
    // back-compat aliases (one-release): existing callers may still read these.
    user: staff,
    adminId: staffId,
    login,
    loginLegacy,
    logout,
    checkAuth,
    clearError,
  }
}

export default useAuth
