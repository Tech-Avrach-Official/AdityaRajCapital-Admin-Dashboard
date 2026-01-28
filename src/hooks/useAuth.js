// useAuth Hook - Authentication utilities

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
} from "@/store/features/auth/authSelectors"
import { loginAdmin, logoutAdmin, checkAuthStatus } from "@/store/features/auth/authThunks"
import { clearAuthError } from "@/store/features/auth/authSlice"

/**
 * Custom hook for authentication
 * Provides auth state and actions in a clean interface
 */
export const useAuth = () => {
  const dispatch = useAppDispatch()
  
  // Selectors
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const adminId = useAppSelector(selectAdminId)
  const loading = useAppSelector(selectAuthLoading)
  const checking = useAppSelector(selectAuthChecking)
  const error = useAppSelector(selectAuthError)
  const authStatus = useAppSelector(selectAuthStatus)
  
  // Actions
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
    // State
    isAuthenticated,
    user,
    adminId,
    loading,
    checking,
    error,
    authStatus,
    
    // Actions
    login,
    logout,
    checkAuth,
    clearError,
  }
}

export default useAuth
