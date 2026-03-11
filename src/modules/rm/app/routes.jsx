import { Route } from "react-router-dom"

export const RMDashboardPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">RM Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome to the RM portal. Content coming soon.</p>
  </div>
)

/**
 * RM nested routes (rendered under RMLayout via <Outlet />).
 * Global router mounts these as children of the /rm route.
 */
export const RMRoutes = () => (
  <>
    <Route index element={<RMDashboardPlaceholder />} />
  </>
)
