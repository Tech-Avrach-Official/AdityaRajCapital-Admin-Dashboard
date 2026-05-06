// Auth Selectors — staff RBAC.

import { createSelector } from "@reduxjs/toolkit"

const selectAuthState = (state) => state.admin.auth

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
)

export const selectStaff = createSelector(
  [selectAuthState],
  (auth) => auth.staff
)

export const selectStaffId = createSelector(
  [selectAuthState],
  (auth) => auth.staff?.id ?? null
)

export const selectRole = createSelector(
  [selectAuthState],
  (auth) => auth.role
)

export const selectIsSuperAdmin = createSelector(
  [selectAuthState],
  (auth) => auth.role === "super_admin"
)

export const selectPermissions = createSelector(
  [selectAuthState],
  (auth) => auth.permissions || []
)

export const selectScope = createSelector(
  [selectAuthState],
  (auth) => auth.scope || { nations: [], states: [], branches: [] }
)

export const selectAuthToken = createSelector(
  [selectAuthState],
  (auth) => auth.token
)

export const selectTokenExp = createSelector(
  [selectAuthState],
  (auth) => auth.tokenExp
)

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
)

export const selectAuthChecking = createSelector(
  [selectAuthState],
  (auth) => auth.checkingAuth
)

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
)

export const selectAuthStatus = createSelector(
  [selectAuthState],
  (auth) => ({
    isAuthenticated: auth.isAuthenticated,
    isChecking: auth.checkingAuth,
    isLoading: auth.loading,
    error: auth.error,
  })
)

// Back-compat: existing callers still read currentUser/adminId. Aliases the
// new staff-shaped state. Remove in Phase 5 once all callers migrate.
export const selectCurrentUser = selectStaff

/** @deprecated Use selectStaffId instead. */
export const selectAdminId = selectStaffId
