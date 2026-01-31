// Root Reducer - Combines all feature reducers
// This file is the single source of truth for all Redux state

import { combineReducers } from "@reduxjs/toolkit"

// Feature reducers - will be imported as they are created
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

/**
 * Root reducer combining all feature slices
 * 
 * State Shape:
 * {
 *   auth: { user, token, isAuthenticated, loading, error }
 *   rms: { ids, entities, selectedId, loading, error, filters, pagination }
 *   partners: { ids, entities, selectedId, loading, error, filters, pagination }
 *   investors: { ids, entities, selectedId, loading, error, filters, pagination }
 *   products: { ids, entities, selectedId, loading, error, filters }
 *   financial: { investments, payouts, commissions }
 *   kyc: { ids, entities, selectedId, loading, error, filters }
 *   dashboard: { metrics, charts, recentActivity, loading, error }
 *   ui: { sidebarOpen, activeModal, modalData, notifications }
 * }
 */
const rootReducer = combineReducers({
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

export default rootReducer
