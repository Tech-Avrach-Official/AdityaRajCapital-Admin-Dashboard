import { Routes, Route } from "react-router-dom"
import GlobalAuthGuard from "@/global/auth/AuthGuard"
import RoleLandingPage from "@/pages/RoleLandingPage"
import AdminLayout from "@/modules/admin/layout/AdminLayout"
import { AdminRoutes } from "@/modules/admin/app/routes"
import LoginPage from "@/modules/admin/pages/auth/LoginPage"
import RMLayout from "@/modules/rm/layout/RMLayout"
import { RMRoutes } from "@/modules/rm/app/routes"
import RMLoginPage from "@/modules/rm/auth/LoginPage"
import PartnerLayout from "@/modules/partner/layout/PartnerLayout"
import { PartnerRoutes } from "@/modules/partner/app/routes"
import PartnerLoginPage from "@/modules/partner/auth/LoginPage"

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<RoleLandingPage />} />
    <Route path="/admin/login" element={<LoginPage />} />
    <Route
      path="/admin"
      element={
        <GlobalAuthGuard tokenKey="adminToken" loginPath="/admin/login">
          <AdminLayout />
        </GlobalAuthGuard>
      }
    >
      {AdminRoutes()}
    </Route>
    <Route path="/rm/login" element={<RMLoginPage />} />
    <Route
      path="/rm"
      element={
        <GlobalAuthGuard tokenKey="rmToken" loginPath="/rm/login">
          <RMLayout />
        </GlobalAuthGuard>
      }
    >
      {RMRoutes()}
    </Route>
    <Route path="/partner/login" element={<PartnerLoginPage />} />
    <Route
      path="/partner"
      element={
        <GlobalAuthGuard tokenKey="partnerToken" loginPath="/partner/login">
          <PartnerLayout />
        </GlobalAuthGuard>
      }
    >
      {PartnerRoutes()}
    </Route>
  </Routes>
)

export default AppRouter
