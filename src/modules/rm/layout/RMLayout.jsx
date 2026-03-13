import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import RMSidebar from "../components/RMSidebar"
import RMHeader from "../components/RMHeader"
import { layout } from "@/lib/theme"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const RMLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <RMSidebar />

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
        <RMSidebar onMobileClose={() => setMobileMenuOpen(false)} />
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
          <RMHeader />
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

export default RMLayout

// import React, { useState } from "react"
// import { Outlet } from "react-router-dom"
// import { Menu, LayoutDashboard, Users } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { NavLink } from "react-router-dom"

// const RMLayout = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [sidebarOpen, setSidebarOpen] = useState(true)

//   return (
//     <div className="flex min-h-screen bg-background">
//       <aside
//         className={cn(
//           "bg-[#1a1d29] text-white h-screen flex flex-col transition-all duration-300",
//           "lg:sticky lg:top-0 lg:left-0 lg:z-40 fixed top-0 left-0 z-50",
//           sidebarOpen ? "w-[240px]" : "w-[64px]"
//         )}
//       >
//         <div className="flex items-center justify-between px-4 h-[64px] border-b border-gray-800/50 shrink-0">
//           {sidebarOpen && (
//             <span className="font-bold text-white">RM Portal</span>
//           )}
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-1.5 hover:bg-gray-800/50 rounded-md text-gray-400 hover:text-white"
//             aria-label="Toggle sidebar"
//           >
//             <Menu size={18} />
//           </button>
//         </div>
//         <nav className="flex-1 py-4 px-2">
//           {sidebarOpen && (
//             <>
//             <NavLink
//               to="/rm"
//               end
//               className={({ isActive }) =>
//                 cn(
//                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
//                   isActive
//                     ? "bg-primary/10 text-primary"
//                     : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
//                 )
//               }
//             >
//               <LayoutDashboard size={20} />
//               <span>Dashboard</span>
//             </NavLink>
//               <NavLink
//               to="/rm/partners"
//               end
//               className={({ isActive }) =>
//                 cn(
//                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
//                   isActive
//                     ? "bg-primary/10 text-primary"
//                     : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
//                 )
//               }
//             >
//               <Users size={20} />
//               <span>Partner</span>
//             </NavLink>
//             </>
//           )}
//         </nav>
//       </aside>

//       {mobileMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={() => setMobileMenuOpen(false)}
//         />
//       )}

//       <div className="flex-1 flex flex-col min-w-0">
//         <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 h-[64px] flex items-center">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             <Menu className="h-5 w-5" />
//           </Button>
//           <h1 className="text-lg font-bold ml-2">RM Portal</h1>
//         </div>

//         <main className="flex-1 overflow-y-auto p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   )
// }

// export default RMLayout
