import { Route } from "react-router-dom"

export const PartnerDashboardPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Partner Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome to the Partner portal. Content coming soon.</p>
  </div>
)

/**
 * Partner nested routes (rendered under PartnerLayout via <Outlet />).
 * Global router mounts these as children of the /partner route.
 */
export const PartnerRoutes = () => (
  <>
    <Route index element={<PartnerDashboardPlaceholder />} />
  </>
)
