import { Route } from "react-router-dom"
import RMDashboard from "../pages/dashboard/RMDashboard"
import Partner from "../pages/partner/Partner"
import Investor from "../pages/investor/Investor"
import Visit from "../pages/visits/Visit"
import InvestorDetails2 from "../pages/investor/components/InvestorDetails2"
import PartnerDetails from "../pages/partner/components/PartnerDetails"
import InvestmentPage from "../pages/investor/components/InvestmentPage"
import VisitDetail from "../pages/visits/components/VisitDetails"





export const RMRoutes = () => (
  <>
    <Route index element={<RMDashboard />} />
     <Route path="partners" element={<Partner />} />
     <Route path="investors" element={<Investor />} />
     <Route path="partners/:id" element={<PartnerDetails />} />
     <Route path="investors/:id" element={<InvestorDetails2 />} />
     <Route path="investors/investment/:id" element={<InvestmentPage />} />
     <Route path="visits" element={<Visit />} />
     <Route path="visits/:id" element={<VisitDetail />} />
  </>
)
