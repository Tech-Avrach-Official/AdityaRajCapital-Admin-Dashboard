import { Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "../admin/layout/AdminLayout"
import AuthGuard from "../admin/components/AuthGuard"
import LoginPage from "../admin/pages/auth/LoginPage"
import Dashboard from "../admin/pages/dashboard/Dashboard"
import RMsPage from "../admin/pages/users/rms/RMsPage"
import RMDetailPage from "../admin/pages/users/rms/RMDetailPage"
import CreateRMPage from "../admin/pages/users/rms/CreateRMPage"
import PartnersPage from "../admin/pages/users/partners/PartnersPage"
import PartnerDetailPage from "../admin/pages/users/partners/PartnerDetailPage"
import InvestorsPage from "../admin/pages/users/investors/InvestorsPage"
import InvestorDetailPage from "../admin/pages/users/investors/InvestorDetailPage"
import InvestmentDetailPage from "../admin/pages/users/investors/InvestmentDetailPage"
import ProductsPage from "../admin/pages/products/ProductsPage"
import PlansListPage from "../admin/pages/plans/PlansListPage"
import CreatePlanPage from "../admin/pages/plans/CreatePlanPage"
import PlanDetailPage from "../admin/pages/plans/PlanDetailPage"
import EditPlanPage from "../admin/pages/plans/EditPlanPage"
import InvestmentsPage from "../admin/pages/financial/investments/InvestmentsPage"
import PayoutsPage from "../admin/pages/financial/payouts/PayoutsPage"
import UploadBankPdfPage from "../admin/pages/financial/payouts/UploadBankPdfPage"
import CommissionsPage from "../admin/pages/financial/commissions/CommissionsPage"
import UploadCommissionPage from "../admin/pages/financial/commissions/UploadCommissionPage"
import PaymentVerificationPage from "../admin/pages/financial/payment-verification/PaymentVerificationPage"
import SettingsPage from "../admin/pages/settings/SettingsPage"
import AuditPage from "../admin/pages/audit/AuditPage"
import NationsPage from "../admin/pages/hierarchy/NationsPage"
import StatesPage from "../admin/pages/hierarchy/StatesPage"
import BranchesPage from "../admin/pages/hierarchy/BranchesPage"

const AllRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to admin dashboard */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin Login - Public Route */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Hierarchy */}
        <Route path="hierarchy/nations" element={<NationsPage />} />
        <Route path="hierarchy/states" element={<StatesPage />} />
        <Route path="hierarchy/branches" element={<BranchesPage />} />

        {/* User Management */}
        <Route path="users/rms" element={<RMsPage />} />
        <Route path="users/rms/new" element={<CreateRMPage />} />
        <Route path="users/rms/:id" element={<RMDetailPage />} />
        <Route path="users/partners" element={<PartnersPage />} />
        <Route path="users/partners/:id" element={<PartnerDetailPage />} />
        <Route path="users/investors/:investorId/investments/:investmentId" element={<InvestmentDetailPage />} />
        <Route path="users/investors/:id" element={<InvestorDetailPage />} />
        <Route path="users/investors" element={<InvestorsPage />} />

        {/* Products (legacy) */}
        <Route path="products" element={<ProductsPage />} />

        {/* Plans (full CRUD) */}
        <Route path="plans" element={<PlansListPage />} />
        <Route path="plans/new" element={<CreatePlanPage />} />
        <Route path="plans/:id" element={<PlanDetailPage />} />
        <Route path="plans/:id/edit" element={<EditPlanPage />} />

        {/* Financial Management */}
        <Route path="financial/investments" element={<InvestmentsPage />} />
        <Route path="financial/payouts" element={<PayoutsPage />} />
        <Route path="financial/payouts/upload" element={<UploadBankPdfPage />} />
        <Route path="financial/commissions" element={<CommissionsPage />} />
        <Route path="financial/commissions/upload" element={<UploadCommissionPage />} />
        <Route path="financial/payment-verification" element={<PaymentVerificationPage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Audit */}
        <Route path="audit" element={<AuditPage />} />
      </Route>
    </Routes>
  )
}

export default AllRoutes
