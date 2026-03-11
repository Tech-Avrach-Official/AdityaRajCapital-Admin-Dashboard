import { combineReducers } from "@reduxjs/toolkit"
import authReducer from "./features/auth/authSlice"
import rmReducer from "./features/rms/rmSlice"
import partnerReducer from "./features/partners/partnerSlice"
import investorReducer from "./features/investors/investorSlice"
import productReducer from "./features/products/productSlice"
import financialReducer from "./features/financial/financialSlice"
import kycReducer from "./features/kyc/kycSlice"
import dashboardReducer from "./features/dashboard/dashboardSlice"
import uiReducer from "./features/ui/uiSlice"
import purchasesReducer from "./features/purchases/purchaseSlice"

export default combineReducers({
  auth: authReducer,
  rms: rmReducer,
  partners: partnerReducer,
  investors: investorReducer,
  products: productReducer,
  financial: financialReducer,
  kyc: kycReducer,
  dashboard: dashboardReducer,
  ui: uiReducer,
  purchases: purchasesReducer,
})
