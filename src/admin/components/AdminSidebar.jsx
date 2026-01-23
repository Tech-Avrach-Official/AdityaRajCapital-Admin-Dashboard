import React, { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  FileCheck,
  Settings,
  FileText,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UserCog,
  Handshake,
  TrendingUp,
  Wallet,
  Percent,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { layout } from "@/lib/theme"

const AdminSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openSubMenu, setOpenSubMenu] = useState(null)
  const location = useLocation()

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      id: "users",
      name: "User Management",
      icon: Users,
      subItems: [
        {
          id: "rms",
          name: "Relationship Managers",
          path: "/admin/users/rms",
          icon: UserCog,
        },
        {
          id: "partners",
          name: "Partners",
          path: "/admin/users/partners",
          icon: Handshake,
        },
        {
          id: "investors",
          name: "Investors",
          path: "/admin/users/investors",
          icon: Users,
        },
      ],
    },
    {
      id: "products",
      name: "Products",
      icon: Package,
      path: "/admin/products",
    },
    {
      id: "financial",
      name: "Financial Management",
      icon: DollarSign,
      subItems: [
        {
          id: "investments",
          name: "Investments",
          path: "/admin/financial/investments",
          icon: TrendingUp,
        },
        {
          id: "payouts",
          name: "Payouts",
          path: "/admin/financial/payouts",
          icon: Wallet,
        },
        {
          id: "commissions",
          name: "Commissions",
          path: "/admin/financial/commissions",
          icon: Percent,
        },
      ],
    },
    {
      id: "kyc",
      name: "KYC Verification",
      icon: FileCheck,
      path: "/admin/kyc",
    },
    {
      id: "settings",
      name: "System Configuration",
      icon: Settings,
      path: "/admin/settings",
    },
    {
      id: "audit",
      name: "Audit & Compliance",
      icon: FileText,
      path: "/admin/audit",
    },
  ]

  const toggleSubMenu = (id) => {
    if (!sidebarOpen) setSidebarOpen(true)
    setOpenSubMenu(openSubMenu === id ? null : id)
  }

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div
      className={cn(
        "bg-gray-900 text-white sticky top-0 h-screen flex flex-col transition-all duration-300 border-r border-gray-800",
        "hidden lg:flex", // Hide on mobile, show on large screens
        sidebarOpen ? "w-[240px]" : "w-[64px]"
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 h-[64px]">
        {sidebarOpen && (
          <h1 className="font-bold text-xl text-white">AdityaRaj Capital</h1>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleSubMenu(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors",
                    openSubMenu === item.id ? "bg-gray-800" : "",
                    isActive(item.subItems[0]?.path) ? "bg-gray-800" : ""
                  )}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform",
                        openSubMenu === item.id ? "rotate-180" : ""
                      )}
                    />
                  )}
                </button>

                {openSubMenu === item.id && sidebarOpen && (
                  <div className="bg-gray-800">
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.id}
                        to={sub.path}
                        className={({ isActive }) =>
                          cn(
                            "block px-4 py-2 ml-6 pl-7 border-l-2 text-sm transition-colors",
                            isActive
                              ? "bg-gray-700 text-white border-primary"
                              : "text-gray-300 border-gray-600 hover:bg-gray-700"
                          )
                        }
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 px-4 py-3 hover:bg-gray-800 transition-all",
                    isActive
                      ? "bg-gray-800 border-l-4 border-primary"
                      : "",
                    !sidebarOpen && "justify-center"
                  )
                }
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors">
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar
