import { combineReducers } from "@reduxjs/toolkit"
import adminReducer from "@/modules/admin/store/reducer"
import rmReducer from "@/modules/rm/store/reducer"
import partnerReducer from "@/modules/partner/store/reducer"

export default combineReducers({
  admin: adminReducer,
  rm: rmReducer,
  partner: partnerReducer,
})
