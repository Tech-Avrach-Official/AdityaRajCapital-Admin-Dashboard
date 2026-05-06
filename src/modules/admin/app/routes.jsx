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
import StaffListPage from "../pages/staff/StaffListPage"
import CreateStaffPage from "../pages/staff/CreateStaffPage"
import StaffDetailPage from "../pages/staff/StaffDetailPage"
import MyProfilePage from "../pages/profile/MyProfilePage"
import RoutePermissionGuard from "../components/RoutePermissionGuard"

const guard = (require, element) => (
  <RoutePermissionGuard require={require}>{element}</RoutePermissionGuard>
)

/**
 * Admin nested routes (rendered under AdminLayout via <Outlet />).
 * Global router mounts these as children of the /admin route.
 */
export const AdminRoutes = () => (
  <>
    <Route index element={guard("dashboard.view", <Dashboard />)} />
    <Route
      path="hierarchy/nations"
      element={guard("hierarchy.nations.view", <NationsPage />)}
    />
    <Route
      path="hierarchy/states"
      element={guard("hierarchy.states.view", <StatesPage />)}
    />
    <Route
      path="hierarchy/branches"
      element={guard("hierarchy.branches.view", <BranchesPage />)}
    />
    <Route path="users/rms" element={guard("rms.view", <RMsPage />)} />
    <Route
      path="users/rms/new"
      element={guard("rms.create", <CreateRMPage />)}
    />
    <Route
      path="users/rms/:id"
      element={guard("rms.view", <RMDetailPage />)}
    />
    <Route
      path="users/deletion-requests"
      element={guard("deletion-requests.view", <DeletionRequestsPage />)}
    />
    <Route
      path="users/partners"
      element={guard("partners.view", <PartnersPage />)}
    />
    <Route
      path="users/partners/:id"
      element={guard("partners.view", <PartnerDetailPage />)}
    />
    <Route
      path="users/investors/:investorId/investments/:investmentId"
      element={guard("investors.view", <InvestmentDetailPage />)}
    />
    <Route
      path="users/investors/:id"
      element={guard("investors.view", <InvestorDetailPage />)}
    />
    <Route
      path="users/investors"
      element={guard("investors.view", <InvestorsPage />)}
    />
    <Route path="products" element={guard("plans.view", <ProductsPage />)} />
    <Route path="plans" element={guard("plans.view", <PlansListPage />)} />
    <Route
      path="plans/new"
      element={guard("plans.create", <CreatePlanPage />)}
    />
    <Route
      path="plans/:id"
      element={guard("plans.view", <PlanDetailPage />)}
    />
    <Route
      path="plans/:id/edit"
      element={guard("plans.update", <EditPlanPage />)}
    />
    <Route
      path="financial/investments"
      element={guard("investments.view", <InvestmentsPage />)}
    />
    <Route
      path="financial/payouts"
      element={guard("payouts.view", <PayoutsPage />)}
    />
    <Route
      path="financial/payouts/upload"
      element={guard("payouts.mark-paid", <UploadBankPdfPage />)}
    />
    <Route
      path="financial/commissions"
      element={guard("commissions.view", <CommissionsPage />)}
    />
    <Route
      path="financial/commissions/upload"
      element={guard("commissions.mark-paid", <UploadCommissionPage />)}
    />
    <Route
      path="financial/payment-verification"
      element={guard("purchases.view", <PaymentVerificationPage />)}
    />
    <Route
      path="settings"
      element={guard("tds-settings.view", <SettingsPage />)}
    />
    <Route path="audit" element={<AuditPage />} />
    <Route path="staff/:rolePlural" element={<StaffListPage />} />
    <Route path="staff/:rolePlural/new" element={<CreateStaffPage />} />
    <Route path="staff/:rolePlural/:id" element={<StaffDetailPage />} />
    <Route path="profile" element={<MyProfilePage />} />
  </>
)
