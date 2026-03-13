import { Route } from "react-router-dom"
import Dashboard from "../pages/dashbord/Dashboard"
import Investors from "../pages/investors/Investors"
import Leaderboard from "../pages/leaderboard/Leaderboard"
import CommissionHistory from "../pages/commissionHistory/CommissionHistory"
import Profile from "../pages/profile/Profile"

/**
 * Partner nested routes (rendered under PartnerLayout via <Outlet />).
 * Global router mounts these as children of the /partner route.
 */
export const PartnerRoutes = () => (
  <>
    <Route index element={<Dashboard />} />
    <Route path="investors" element={<Investors />} />
    <Route path="leaderboard" element={<Leaderboard />} />
    <Route path="commissions-history" element={<CommissionHistory />} />
    <Route path="profile" element={<Profile />} />
    {/* <Route path="user" element={} /> */}
  </>
)
