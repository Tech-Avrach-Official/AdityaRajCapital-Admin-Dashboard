import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Lock, Mail, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

const RMLoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/rm"

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    const next = {}
    if (!formData.email?.trim()) next.email = "Email is required"
    if (!formData.password) next.password = "Password is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE}/api/rm/login`, {
        email: formData.email.trim(),
        password: formData.password,
      })
      if (data?.success && data?.data) {
        const { token, rm } = data.data
        localStorage.setItem("rmToken", token)
        if (rm?.id != null) localStorage.setItem("rmId", String(rm.id))
        toast.success(data.message || "Login successful")
        navigate(from, { replace: true })
      } else {
        toast.error(data?.message || "Login failed")
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">RM Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="rm@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RMLoginPage
