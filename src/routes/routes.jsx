import { Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "../admin/layout/AdminLayout"
import Dashboard from "../admin/pages/dashboard/Dashboard"
import RMsPage from "../admin/pages/users/rms/RMsPage"
import PartnersPage from "../admin/pages/users/partners/PartnersPage"
import InvestorsPage from "../admin/pages/users/investors/InvestorsPage"
import ProductsPage from "../admin/pages/products/ProductsPage"
import InvestmentsPage from "../admin/pages/financial/investments/InvestmentsPage"
import PayoutsPage from "../admin/pages/financial/payouts/PayoutsPage"
import CommissionsPage from "../admin/pages/financial/commissions/CommissionsPage"
import KYCPage from "../admin/pages/kyc/KYCPage"
import SettingsPage from "../admin/pages/settings/SettingsPage"
import AuditPage from "../admin/pages/audit/AuditPage"

const AllRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to admin dashboard */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        
        {/* User Management */}
        <Route path="users/rms" element={<RMsPage />} />
        <Route path="users/partners" element={<PartnersPage />} />
        <Route path="users/investors" element={<InvestorsPage />} />
        
        {/* Products */}
        <Route path="products" element={<ProductsPage />} />
        
        {/* Financial Management */}
        <Route path="financial/investments" element={<InvestmentsPage />} />
        <Route path="financial/payouts" element={<PayoutsPage />} />
        <Route path="financial/commissions" element={<CommissionsPage />} />
        
        {/* KYC */}
        <Route path="kyc" element={<KYCPage />} />
        
        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
        
        {/* Audit */}
        <Route path="audit" element={<AuditPage />} />
      </Route>
    </Routes>
  )
}

export default AllRoutes
