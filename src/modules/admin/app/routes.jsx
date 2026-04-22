import { Route } from "react-router-dom"
import Dashboard from "../pages/dashboard/Dashboard"
import RMsPage from "../pages/users/rms/RMsPage"
import RMDetailPage from "../pages/users/rms/RMDetailPage"
import CreateRMPage from "../pages/users/rms/CreateRMPage"
import PartnersPage from "../pages/users/partners/PartnersPage"
import PartnerDetailPage from "../pages/users/partners/PartnerDetailPage"
import InvestorsPage from "../pages/users/investors/InvestorsPage"
import InvestorDetailPage from "../pages/users/investors/InvestorDetailPage"
import InvestmentDetailPage from "../pages/users/investors/InvestmentDetailPage"
import ProductsPage from "../pages/products/ProductsPage"
import PlansListPage from "../pages/plans/PlansListPage"
import CreatePlanPage from "../pages/plans/CreatePlanPage"
import PlanDetailPage from "../pages/plans/PlanDetailPage"
import EditPlanPage from "../pages/plans/EditPlanPage"
import InvestmentsPage from "../pages/financial/investments/InvestmentsPage"
import PayoutsPage from "../pages/financial/payouts/PayoutsPage"
import UploadBankPdfPage from "../pages/financial/payouts/UploadBankPdfPage"
import CommissionsPage from "../pages/financial/commissions/CommissionsPage"
import UploadCommissionPage from "../pages/financial/commissions/UploadCommissionPage"
import PaymentVerificationPage from "../pages/financial/payment-verification/PaymentVerificationPage"
import SettingsPage from "../pages/settings/SettingsPage"
import AuditPage from "../pages/audit/AuditPage"
import NationsPage from "../pages/hierarchy/NationsPage"
import StatesPage from "../pages/hierarchy/StatesPage"
import BranchesPage from "../pages/hierarchy/BranchesPage"
import DeletionRequestsPage from "../pages/deletion-requests/DeletionRequestsPage"

/**
 * Admin nested routes (rendered under AdminLayout via <Outlet />).
 * Global router mounts these as children of the /admin route.
 */
export const AdminRoutes = () => (
  <>
    <Route index element={<Dashboard />} />
    <Route path="hierarchy/nations" element={<NationsPage />} />
    <Route path="hierarchy/states" element={<StatesPage />} />
    <Route path="hierarchy/branches" element={<BranchesPage />} />
    <Route path="users/rms" element={<RMsPage />} />
    <Route path="users/rms/new" element={<CreateRMPage />} />
    <Route path="users/rms/:id" element={<RMDetailPage />} />
    <Route path="users/deletion-requests" element={<DeletionRequestsPage />} />
    <Route path="users/partners" element={<PartnersPage />} />
    <Route path="users/partners/:id" element={<PartnerDetailPage />} />
    <Route path="users/investors/:investorId/investments/:investmentId" element={<InvestmentDetailPage />} />
    <Route path="users/investors/:id" element={<InvestorDetailPage />} />
    <Route path="users/investors" element={<InvestorsPage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="plans" element={<PlansListPage />} />
    <Route path="plans/new" element={<CreatePlanPage />} />
    <Route path="plans/:id" element={<PlanDetailPage />} />
    <Route path="plans/:id/edit" element={<EditPlanPage />} />
    <Route path="financial/investments" element={<InvestmentsPage />} />
    <Route path="financial/payouts" element={<PayoutsPage />} />
    <Route path="financial/payouts/upload" element={<UploadBankPdfPage />} />
    <Route path="financial/commissions" element={<CommissionsPage />} />
    <Route path="financial/commissions/upload" element={<UploadCommissionPage />} />
    <Route path="financial/payment-verification" element={<PaymentVerificationPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="audit" element={<AuditPage />} />
  </>
)
