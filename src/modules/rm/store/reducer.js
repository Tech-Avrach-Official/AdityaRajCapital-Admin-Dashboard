import { combineReducers } from "@reduxjs/toolkit"
// import rmReportReducer from '../features/rmReport/rmReportSlice';
import rmReportReducer from './features/dashboard/dashboardSlice'

export default combineReducers({
    // dashboard:dashboardReducer
    rmReport: rmReportReducer,
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
