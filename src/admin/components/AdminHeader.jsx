import React, { useState } from "react"
import { Bell, Search, ChevronDown } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { layout } from "@/lib/theme"
import { cn } from "@/lib/utils"

const AdminHeader = () => {
  const [notifications] = useState(5) // Mock notification count

  return (
    <header
      className="bg-white shadow-sm border-b border-border sticky top-0 z-50"
      style={{ height: layout.headerHeight }}
    >
      <div className="flex items-center justify-between px-6 h-full">
        {/* Logo - Left */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground hidden md:block">
            AdityaRaj Capital
          </h1>
        </div>

        {/* Search - Center (Optional) */}
        <div className="relative flex-1 max-w-md mx-4 lg:mx-8 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10"
          />
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
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

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-muted rounded-lg px-3 py-2 transition-colors">
              <Avatar>
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  SA
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-foreground">
                  Super Admin
                </p>
                <p className="text-xs text-muted-foreground">
                  admin@adityarajcapital.com
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
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
