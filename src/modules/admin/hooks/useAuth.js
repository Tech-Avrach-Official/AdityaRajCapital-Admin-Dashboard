// useAuth Hook - Authentication utilities (admin module)

import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectAdminId,
  selectAuthLoading,
  selectAuthChecking,
  selectAuthError,
  selectAuthStatus,
} from "@/modules/admin/store/features/auth/authSelectors"
import { loginAdmin, logoutAdmin, checkAuthStatus } from "@/modules/admin/store/features/auth/authThunks"
import { clearAuthError } from "@/modules/admin/store/features/auth/authSlice"

/**
 * Custom hook for admin authentication
 */
export const useAuth = () => {
  const dispatch = useAppDispatch()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const adminId = useAppSelector(selectAdminId)
  const loading = useAppSelector(selectAuthLoading)
  const checking = useAppSelector(selectAuthChecking)
  const error = useAppSelector(selectAuthError)
  const authStatus = useAppSelector(selectAuthStatus)

  const login = useCallback(
    async (credentials) => {
      const result = await dispatch(loginAdmin(credentials))
      return result
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutAdmin())
  }, [dispatch])

  const checkAuth = useCallback(async () => {
    await dispatch(checkAuthStatus())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  return {
    isAuthenticated,
    user,
    adminId,
    loading,
    checking,
    error,
    authStatus,
    login,
    logout,
    checkAuth,
    clearError,
  }
}

export default useAuth
