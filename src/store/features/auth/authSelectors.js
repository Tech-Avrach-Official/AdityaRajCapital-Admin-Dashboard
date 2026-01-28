// Auth Selectors - Memoized selectors for auth state
// Provides efficient access to auth state in components

import { createSelector } from "@reduxjs/toolkit"

/**
 * Base selector - gets auth slice
 */
const selectAuthState = (state) => state.auth

/**
 * Select if user is authenticated
 */
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
)

/**
 * Select current user object
 */
export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
)

/**
 * Select admin ID
 */
export const selectAdminId = createSelector(
  [selectAuthState],
  (auth) => auth.adminId
)

/**
 * Select auth token
 */
export const selectAuthToken = createSelector(
  [selectAuthState],
  (auth) => auth.token
)

/**
 * Select auth loading state
 */
export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
)

/**
 * Select auth checking state (initial load)
 */
export const selectAuthChecking = createSelector(
  [selectAuthState],
  (auth) => auth.checkingAuth
)

/**
 * Select auth error
 */
export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
)

/**
 * Combined selector for auth status
 * Useful for AuthGuard components
 */
export const selectAuthStatus = createSelector(
  [selectAuthState],
  (auth) => ({
    isAuthenticated: auth.isAuthenticated,
    isChecking: auth.checkingAuth,
    isLoading: auth.loading,
    error: auth.error,
  })
)
