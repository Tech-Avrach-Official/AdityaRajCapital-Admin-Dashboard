import { createSlice } from "@reduxjs/toolkit"
import { fetchRMReport } from "./dashboardThunks"

const initialState = {
  report: {
    period: "overall",
    total_partners: 0,
    total_investors: 0,
    total_commission_earned: 0,
    total_receivable_commission: 0,
    total_pending_commission: 0,
  },

  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRMReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRMReport.fulfilled, (state, action) => {
        state.loading = false
        state.report = action.payload
      })
      .addCase(fetchRMReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default dashboardSlice.reducer