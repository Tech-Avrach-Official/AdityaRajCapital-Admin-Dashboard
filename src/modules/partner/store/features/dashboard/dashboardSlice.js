import { createSlice } from "@reduxjs/toolkit"
import {
    fetchCommissionHistory,
  fetchCommissionSummary,
  fetchInvestorSummary,
} from "./dashboardThunk"

const initialState = {

  commissionSummary: null,

  commissionHistory: [],
  historyPagination: {
    limit: 10,
    offset: 0,
  },

  historyLoading: false,

  investorSummary: {
    totalInvestors: 0,
    activeInvestors: 0,
    totalInvestedAmount: 0,
    totalInvestments: 0,
  },

  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: "partnerDashboard",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder
      .addCase(fetchCommissionSummary.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCommissionSummary.fulfilled, (state, action) => {
        state.loading = false
        state.commissionSummary = action.payload
      })
      .addCase(fetchCommissionSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    builder
      .addCase(fetchInvestorSummary.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchInvestorSummary.fulfilled, (state, action) => {
  state.loading = false
  state.investorSummary = {
    ...state.investorSummary,
    ...action.payload
  }
})
      .addCase(fetchInvestorSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      builder
      .addCase(fetchCommissionHistory.pending, (state) => {
        state.historyLoading = true
      })
    
      .addCase(fetchCommissionHistory.fulfilled, (state, action) => {
        state.historyLoading = false
    
        state.commissionHistory = action.payload.list
        state.historyPagination = action.payload.pagination
      })
    
      .addCase(fetchCommissionHistory.rejected, (state, action) => {
        state.historyLoading = false
        state.error = action.payload
      })
  },


})

export default dashboardSlice.reducer