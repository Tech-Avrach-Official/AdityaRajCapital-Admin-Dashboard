// Financial Slice - Combined state for investments, payouts, commissions

import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import {
  fetchInvestments,
  fetchPayouts,
  fetchCommissions,
  uploadBankPDF,
} from "./financialThunks"

// Entity adapters for each financial type
const investmentsAdapter = createEntityAdapter({
  selectId: (investment) => investment.id,
})

const payoutsAdapter = createEntityAdapter({
  selectId: (payout) => payout.id,
})

const commissionsAdapter = createEntityAdapter({
  selectId: (commission) => commission.id,
})

const initialState = {
  // Investments
  investments: investmentsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: { search: "", status: "all", productId: null },
    pagination: { page: 1, limit: 10, total: 0 },
  }),
  
  // Payouts
  payouts: payoutsAdapter.getInitialState({
    loading: false,
    uploading: false,
    error: null,
    filters: { search: "", status: "all" },
    pagination: { page: 1, limit: 10, total: 0 },
  }),
  
  // Commissions
  commissions: commissionsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: { search: "", status: "all", partnerId: null },
    pagination: { page: 1, limit: 10, total: 0 },
  }),
  
  // Selected items
  selectedInvestment: null,
  selectedPayout: null,
  selectedCommission: null,
}

const financialSlice = createSlice({
  name: "financial",
  initialState,
  reducers: {
    // Investment filters
    setInvestmentFilters: (state, action) => {
      state.investments.filters = { ...state.investments.filters, ...action.payload }
      state.investments.pagination.page = 1
    },
    clearInvestmentFilters: (state) => {
      state.investments.filters = initialState.investments.filters
    },
    setSelectedInvestment: (state, action) => {
      state.selectedInvestment = action.payload
    },
    
    // Payout filters
    setPayoutFilters: (state, action) => {
      state.payouts.filters = { ...state.payouts.filters, ...action.payload }
      state.payouts.pagination.page = 1
    },
    clearPayoutFilters: (state) => {
      state.payouts.filters = initialState.payouts.filters
    },
    setSelectedPayout: (state, action) => {
      state.selectedPayout = action.payload
    },
    
    // Commission filters
    setCommissionFilters: (state, action) => {
      state.commissions.filters = { ...state.commissions.filters, ...action.payload }
      state.commissions.pagination.page = 1
    },
    clearCommissionFilters: (state) => {
      state.commissions.filters = initialState.commissions.filters
    },
    setSelectedCommission: (state, action) => {
      state.selectedCommission = action.payload
    },
    
    // Clear errors
    clearFinancialErrors: (state) => {
      state.investments.error = null
      state.payouts.error = null
      state.commissions.error = null
    },
    
    // Reset
    resetFinancial: () => initialState,
  },
  extraReducers: (builder) => {
    // Investments
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.investments.loading = true
        state.investments.error = null
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.investments.loading = false
        investmentsAdapter.setAll(state.investments, action.payload.data)
        state.investments.pagination.total = action.payload.total
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.investments.loading = false
        state.investments.error = action.payload
      })
    
    // Payouts
    builder
      .addCase(fetchPayouts.pending, (state) => {
        state.payouts.loading = true
        state.payouts.error = null
      })
      .addCase(fetchPayouts.fulfilled, (state, action) => {
        state.payouts.loading = false
        payoutsAdapter.setAll(state.payouts, action.payload.data)
        state.payouts.pagination.total = action.payload.total
      })
      .addCase(fetchPayouts.rejected, (state, action) => {
        state.payouts.loading = false
        state.payouts.error = action.payload
      })
    
    // Upload Bank PDF
    builder
      .addCase(uploadBankPDF.pending, (state) => {
        state.payouts.uploading = true
      })
      .addCase(uploadBankPDF.fulfilled, (state) => {
        state.payouts.uploading = false
      })
      .addCase(uploadBankPDF.rejected, (state, action) => {
        state.payouts.uploading = false
        state.payouts.error = action.payload
      })
    
    // Commissions
    builder
      .addCase(fetchCommissions.pending, (state) => {
        state.commissions.loading = true
        state.commissions.error = null
      })
      .addCase(fetchCommissions.fulfilled, (state, action) => {
        state.commissions.loading = false
        commissionsAdapter.setAll(state.commissions, action.payload.data)
        state.commissions.pagination.total = action.payload.total
      })
      .addCase(fetchCommissions.rejected, (state, action) => {
        state.commissions.loading = false
        state.commissions.error = action.payload
      })
  },
})

export const {
  setInvestmentFilters,
  clearInvestmentFilters,
  setSelectedInvestment,
  setPayoutFilters,
  clearPayoutFilters,
  setSelectedPayout,
  setCommissionFilters,
  clearCommissionFilters,
  setSelectedCommission,
  clearFinancialErrors,
  resetFinancial,
} = financialSlice.actions

// Adapter selectors
export const investmentsSelectors = investmentsAdapter.getSelectors(
  (state) => state.financial.investments
)
export const payoutsSelectors = payoutsAdapter.getSelectors(
  (state) => state.financial.payouts
)
export const commissionsSelectors = commissionsAdapter.getSelectors(
  (state) => state.financial.commissions
)

export default financialSlice.reducer
