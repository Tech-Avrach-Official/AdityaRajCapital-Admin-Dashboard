import React, { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks"
import { Loader2 } from "lucide-react"

/**
 * AuthGuard - Protects admin routes from unauthenticated access
 * 
 * Uses Redux auth state to check authentication.
 * Handles initial auth check on app load.
 */
const AuthGuard = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, checking, checkAuth } = useAuth()

  // Check auth status on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Show loading while checking auth status
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // Authenticated - render children
  return children
}

export default AuthGuard
