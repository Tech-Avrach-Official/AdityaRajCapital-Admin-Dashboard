import React from "react"
import { Outlet } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import AdminHeader from "../components/AdminHeader"
import { layout } from "@/lib/theme"

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Right side content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <AdminHeader />

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8"
          style={{
            maxWidth: layout.contentMaxWidth,
            margin: "0 auto",
            width: "100%",
            paddingTop: "24px",
            paddingBottom: "24px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
