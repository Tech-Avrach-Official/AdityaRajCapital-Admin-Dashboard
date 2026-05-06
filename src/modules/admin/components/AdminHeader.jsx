import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, ChevronDown, LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { layout } from "@/lib/theme"
import { useAuth } from "@/modules/admin/hooks"
import GlobalSearch from "@/modules/admin/components/GlobalSearch"

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  nation_head: "Nation Head",
  state_head: "State Head",
  branch_head: "Branch Head",
}

const ROLE_BADGE_CLASSES = {
  super_admin: "bg-red-100 text-red-700 hover:bg-red-100",
  admin: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  nation_head: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  state_head: "bg-green-100 text-green-700 hover:bg-green-100",
  branch_head: "bg-gray-100 text-gray-700 hover:bg-gray-100",
}

const initialsFor = (name, email) => {
  const source = (name || email || "").trim()
  if (!source) return "SA"
  const parts = source.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

const AdminHeader = () => {
  const navigate = useNavigate()
  const [notifications] = useState(5)

  const { staff, role, logout } = useAuth()
  const displayName = staff?.name || staff?.email || "Staff"
  const displayEmail = staff?.email || ""
  const roleLabel = role ? ROLE_LABELS[role] || role : null
  const roleClass = role ? ROLE_BADGE_CLASSES[role] || "" : ""

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out successfully")
    navigate("/admin/login", { replace: true })
  }

  return (
    <header
      className="bg-white shadow-sm border-b border-border sticky top-0 z-50"
      style={{ height: layout.headerHeight }}
    >
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground hidden md:block">
            AdityaRaj Capital
          </h1>
        </div>

        <div className="flex-1 mx-4 lg:mx-8 hidden md:block">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-muted rounded-lg px-3 py-2 transition-colors">
              <Avatar>
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initialsFor(staff?.name, staff?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {displayName}
                  </p>
                  {roleLabel && (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] py-0 px-1.5 ${roleClass}`}
                    >
                      {roleLabel}
                    </Badge>
                  )}
                </div>
                {displayEmail && (
                  <p className="text-xs text-muted-foreground">
                    {displayEmail}
                  </p>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
