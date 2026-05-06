import React, { useEffect, useRef, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Loader2, Menu } from "lucide-react"
import AdminSidebar from "../components/AdminSidebar"
import AdminHeader from "../components/AdminHeader"
import { layout } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  selectAuthChecking,
  selectIsAuthenticated,
  selectTokenExp,
} from "@/modules/admin/store/features/auth/authSelectors"
import { checkAuthStatus } from "@/modules/admin/store/features/auth/authThunks"
import { useAuth } from "@/modules/admin/hooks"

// Re-hydrate auth from the persisted JWT on mount. Without this, a hard
// refresh leaves Redux empty (role/permissions/scope) even though the token
// is still in localStorage, so anything gated on permissions renders blank.
// If the persisted token is missing/invalid/expired, redirect to login.
const useRehydrateAuth = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const checkingAuth = useAppSelector(selectAuthChecking)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current || isAuthenticated) {
      ranRef.current = true
      return
    }
    ranRef.current = true
    dispatch(checkAuthStatus())
  }, [dispatch, isAuthenticated])

  // After rehydrate resolves, if still not authenticated, send to login.
  useEffect(() => {
    if (!ranRef.current) return
    if (!checkingAuth && !isAuthenticated) {
      navigate("/admin/login", { replace: true })
    }
  }, [checkingAuth, isAuthenticated, navigate])
}

// Proactively log out and redirect to login when the token's `exp` claim
// passes, so users don't get a surprise 401 mid-form.
const useTokenExpiryWatchdog = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const tokenExp = useAppSelector(selectTokenExp)
  const triggeredRef = useRef(false)

  useEffect(() => {
    if (!tokenExp) return undefined
    triggeredRef.current = false
    const check = async () => {
      if (triggeredRef.current) return
      const now = Date.now()
      if (tokenExp * 1000 - now <= 0) {
        triggeredRef.current = true
        await logout()
        toast.error("Session expired. Please log in again.")
        navigate("/admin/login", { replace: true })
      }
    }
    check()
    const interval = window.setInterval(check, 60_000)
    return () => window.clearInterval(interval)
  }, [tokenExp, logout, navigate])
}

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useRehydrateAuth()
  useTokenExpiryWatchdog()

  const checkingAuth = useAppSelector(selectAuthChecking)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  // While the persisted JWT is being decoded back into Redux, show a spinner
  // so the (permission-filtered) sidebar doesn't briefly render empty.
  if (checkingAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar onMobileClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Right side content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header with mobile menu button */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b">
          <div className="flex items-center gap-4 px-4 h-[64px]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">AdityaRaj Capital</h1>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <AdminHeader />
        </div>

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: layout.contentPadding,
            maxWidth: layout.contentMaxWidth,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
