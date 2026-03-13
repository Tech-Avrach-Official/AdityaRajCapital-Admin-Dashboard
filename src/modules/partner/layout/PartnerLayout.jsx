import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { layout } from "@/lib/theme"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import PartnerSidebar from "../components/PartnerSidebar"
import PartnerHeader from "../components/PartnerHeader"

const PartnerLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <PartnerSidebar />

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
        <PartnerSidebar onMobileClose={() => setMobileMenuOpen(false)} />
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
          <PartnerHeader />
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

export default PartnerLayout
