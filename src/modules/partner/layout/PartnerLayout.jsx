import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Menu, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NavLink } from "react-router-dom"

const PartnerLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "bg-[#1a1d29] text-white h-screen flex flex-col transition-all duration-300",
          "lg:sticky lg:top-0 lg:left-0 lg:z-40 fixed top-0 left-0 z-50",
          sidebarOpen ? "w-[240px]" : "w-[64px]"
        )}
      >
        <div className="flex items-center justify-between px-4 h-[64px] border-b border-gray-800/50 shrink-0">
          {sidebarOpen && (
            <span className="font-bold text-white">Partner Portal</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-800/50 rounded-md text-gray-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        </div>
        <nav className="flex-1 py-4 px-2">
          {sidebarOpen && (
            <NavLink
              to="/partner"
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                )
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          )}
        </nav>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 h-[64px] flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold ml-2">Partner Portal</h1>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PartnerLayout
