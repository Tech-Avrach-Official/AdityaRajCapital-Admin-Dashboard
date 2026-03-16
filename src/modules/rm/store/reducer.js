import { combineReducers } from "@reduxjs/toolkit"
// import rmReportReducer from '../features/rmReport/rmReportSlice';
import rmReportReducer from './features/dashboard/dashboardSlice'
import authReducer from "./features/auth/authSlice"
export default combineReducers({
    // dashboard:dashboardReducer
    rmReport: rmReportReducer,
    auth: authReducer,
//   auth: authReducer,
//   rms: rmReducer,
//   partners: partnerReducer,
//   investors: investorReducer,
//   products: productReducer,
//   financial: financialReducer,
//   kyc: kycReducer,
//   dashboard: dashboardReducer,
//   ui: uiReducer,
  
})
