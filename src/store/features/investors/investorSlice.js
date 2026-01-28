// Investor Slice - Investor state management

import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { fetchInvestors, fetchInvestorById } from "./investorThunks"

const investorsAdapter = createEntityAdapter({
  selectId: (investor) => investor.id,
  sortComparer: (a, b) => {
    const dateA = new Date(a.createdDate || 0)
    const dateB = new Date(b.createdDate || 0)
    return dateB - dateA
  },
})

const initialState = investorsAdapter.getInitialState({
  selectedId: null,
  selectedInvestor: null,
  loading: false,
  error: null,
  
  filters: {
    search: "",
    kycStatus: "all",
    partnerId: null,
  },
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})

const investorSlice = createSlice({
  name: "investors",
  initialState,
  reducers: {
    setSelectedInvestor: (state, action) => {
      state.selectedId = action.payload?.id || action.payload
      state.selectedInvestor = action.payload
    },
    clearSelectedInvestor: (state) => {
      state.selectedId = null
      state.selectedInvestor = null
    },
    setInvestorFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    clearInvestorFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    },
    setInvestorPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearInvestorError: (state) => {
      state.error = null
    },
    resetInvestors: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvestors.fulfilled, (state, action) => {
        state.loading = false
        investorsAdapter.setAll(state, action.payload.data)
        state.pagination.total = action.payload.total
      })
      .addCase(fetchInvestors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    builder
      .addCase(fetchInvestorById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchInvestorById.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          investorsAdapter.upsertOne(state, action.payload)
          state.selectedInvestor = action.payload
          state.selectedId = action.payload.id
        }
      })
      .addCase(fetchInvestorById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setSelectedInvestor,
  clearSelectedInvestor,
  setInvestorFilters,
  clearInvestorFilters,
  setInvestorPagination,
  clearInvestorError,
  resetInvestors,
} = investorSlice.actions

export const {
  selectAll: selectAllInvestorsFromAdapter,
  selectById: selectInvestorByIdFromAdapter,
  selectIds: selectInvestorIds,
} = investorsAdapter.getSelectors((state) => state.investors)

export default investorSlice.reducer
