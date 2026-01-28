import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Lock, User, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks"

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/admin"

  const { login, isAuthenticated, loading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    admin_id: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  // Clear auth error on unmount
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.admin_id.trim()) {
      errors.admin_id = "Admin ID is required"
    }
    if (!formData.password) {
      errors.password = "Password is required"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please enter admin ID and password")
      return
    }

    const result = await login({
      admin_id: formData.admin_id.trim(),
      password: formData.password,
    })

    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Login successful")
      navigate(from, { replace: true })
    } else {
      // Error is handled by the middleware/thunk
      const errorMessage = result.payload || "Login failed"
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AdityaRaj Capital</h1>
          <p className="text-gray-600">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Admin ID Field */}
              <div className="space-y-2">
                <Label htmlFor="admin_id">Admin ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin_id"
                    name="admin_id"
                    type="text"
                    placeholder="Enter your admin ID"
                    value={formData.admin_id}
                    onChange={handleChange}
                    className={`pl-10 ${formErrors.admin_id ? "border-destructive" : ""}`}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
                {formErrors.admin_id && (
                  <p className="text-sm text-destructive">{formErrors.admin_id}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 ${formErrors.password ? "border-destructive" : ""}`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
              </div>

              {/* Auth Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} AdityaRaj Capital. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
