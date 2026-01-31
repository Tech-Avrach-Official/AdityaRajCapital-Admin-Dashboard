import React, { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  FileCheck,
  Settings,
  FileText,
  ChevronRight,
  Menu,
  X,
  LogOut,
  UserCog,
  Handshake,
  TrendingUp,
  Wallet,
  Percent,
  CreditCard,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const AdminSidebar = ({ onMobileClose }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openSubMenu, setOpenSubMenu] = useState(null)
  const location = useLocation()

  // Auto-expand submenu if current path matches
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const isActiveSubmenu = item.subItems.some((sub) =>
          location.pathname.startsWith(sub.path)
        )
        if (isActiveSubmenu) {
          setOpenSubMenu(item.id)
        }
      }
    })
  }, [location.pathname])

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
        {
          id: "payment-verification",
          name: "Payment Verification",
          path: "/admin/financial/payment-verification",
          icon: CreditCard,
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
    if (!sidebarOpen) {
      setSidebarOpen(true)
      setTimeout(() => setOpenSubMenu(id), 100)
    } else {
      setOpenSubMenu(openSubMenu === id ? null : id)
    }
  }

  const isActiveRoute = (path) => {
    // For dashboard, only match exact path (not child routes like /admin/users, etc.)
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/"
    }
    // For other routes, match exact path or paths that start with the route + "/"
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const isSubmenuActive = (subItems) => {
    return subItems?.some((sub) => isActiveRoute(sub.path))
  }

  return (
    <aside
      className={cn(
        "bg-[#1a1d29] text-white h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-gray-800/50",
        "lg:sticky lg:top-0 lg:left-0 lg:z-40",
        "fixed top-0 left-0 z-50", // Mobile: fixed drawer
        sidebarOpen ? "w-[240px]" : "w-[64px] lg:w-[64px]"
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between px-4 h-[64px] border-b border-gray-800/50 shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AR</span>
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">
                AdityaRaj Capital
              </h1>
              <p className="text-xs text-gray-400 leading-tight">Admin Panel</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">AR</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "p-1.5 hover:bg-gray-800/50 rounded-md transition-colors",
            "text-gray-400 hover:text-white"
          )}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="px-2 space-y-1">
          {menuItems.map((item) => {
            const hasSubmenu = !!item.subItems
            const isActive = hasSubmenu
              ? isSubmenuActive(item.subItems)
              : isActiveRoute(item.path)
            const isSubmenuOpen = openSubMenu === item.id

            return (
              <div key={item.id}>
                {hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleSubMenu(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                        "text-sm font-medium",
                        isActive
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white",
                        !sidebarOpen && "justify-center px-2"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <item.icon
                          size={20}
                          className={cn(
                            "shrink-0",
                            isActive ? "text-primary" : "text-gray-400"
                          )}
                        />
                        {sidebarOpen && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        <ChevronRight
                          size={16}
                          className={cn(
                            "shrink-0 transition-transform duration-200 text-gray-400",
                            isSubmenuOpen && "rotate-90"
                          )}
                        />
                      )}
                    </button>

                    {isSubmenuOpen && sidebarOpen && (
                      <div className="mt-1 ml-2 space-y-0.5 border-l border-gray-800/50 pl-2">
                        {item.subItems.map((sub) => {
                          const isSubActive = isActiveRoute(sub.path)
                          return (
                            <NavLink
                              key={sub.id}
                              to={sub.path}
                              onClick={() => {
                                if (onMobileClose && window.innerWidth < 1024) {
                                  onMobileClose()
                                }
                              }}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                "text-gray-400 hover:text-white hover:bg-gray-800/50",
                                isSubActive &&
                                  "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-2 pl-5"
                              )}
                            >
                              <sub.icon
                                size={16}
                                className={cn(
                                  "shrink-0",
                                  isSubActive ? "text-primary" : "text-gray-500"
                                )}
                              />
                              <span className="truncate">{sub.name}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (onMobileClose && window.innerWidth < 1024) {
                        onMobileClose()
                      }
                    }}
                    end={item.path === "/admin"} // Use 'end' prop for exact matching on dashboard
                    className={({ isActive }) => {
                      const active = item.path === "/admin" 
                        ? (location.pathname === "/admin" || location.pathname === "/admin/")
                        : isActive
                      return cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        "text-sm font-medium",
                        active
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white",
                        !sidebarOpen && "justify-center px-2"
                      )
                    }}
                  >
                    <item.icon
                      size={20}
                      className={cn(
                        "shrink-0",
                        isActiveRoute(item.path)
                          ? "text-primary"
                          : "text-gray-400"
                      )}
                    />
                    {sidebarOpen && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </NavLink>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800/50 p-4 shrink-0">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400",
            !sidebarOpen && "justify-center px-2"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

    </aside>
  )
}

export default AdminSidebar
