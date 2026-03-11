import React from "react"
import { Navigate, useLocation } from "react-router-dom"

/**
 * Generic AuthGuard - protects routes by checking presence of token in localStorage.
 * No Redux, no API. Each module uses it with its own tokenKey and loginPath.
 *
 * @param {Object} props
 * @param {string} props.tokenKey - localStorage key for the JWT
 * @param {string} props.loginPath - Path to redirect when not authenticated
 * @param {React.ReactNode} [props.children] - Content to render when authenticated
 */
const AuthGuard = ({ tokenKey, loginPath, children }) => {
  const location = useLocation()
  const token = localStorage.getItem(tokenKey)

  if (!token) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location }}
        replace
      />
    )
  }

  return children
}

export default AuthGuard
