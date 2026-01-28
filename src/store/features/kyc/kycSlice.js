// KYC Slice - KYC verification state management

import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { fetchKYCList, fetchKYCDetail, verifyKYC, rejectKYC } from "./kycThunks"

const kycAdapter = createEntityAdapter({
  selectId: (kyc) => kyc.id,
  sortComparer: (a, b) => {
    const dateA = new Date(a.submittedAt || a.createdDate || 0)
    const dateB = new Date(b.submittedAt || b.createdDate || 0)
    return dateB - dateA
  },
})

const initialState = kycAdapter.getInitialState({
  selectedId: null,
  selectedKYC: null,
  loading: false,
  processing: false,
  error: null,
  
  filters: {
    search: "",
    status: "all", // all, pending, verified, rejected
    type: "all",   // all, investor, partner
  },
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})

const kycSlice = createSlice({
  name: "kyc",
  initialState,
  reducers: {
    setSelectedKYC: (state, action) => {
      state.selectedId = action.payload?.id || action.payload
      state.selectedKYC = action.payload
    },
    clearSelectedKYC: (state) => {
      state.selectedId = null
      state.selectedKYC = null
    },
    setKYCFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    clearKYCFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    },
    setKYCPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearKYCError: (state) => {
      state.error = null
    },
    resetKYC: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch KYC List
    builder
      .addCase(fetchKYCList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchKYCList.fulfilled, (state, action) => {
        state.loading = false
        kycAdapter.setAll(state, action.payload.data)
        state.pagination.total = action.payload.total
      })
      .addCase(fetchKYCList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Fetch KYC Detail
    builder
      .addCase(fetchKYCDetail.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchKYCDetail.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          kycAdapter.upsertOne(state, action.payload)
          state.selectedKYC = action.payload
          state.selectedId = action.payload.id
        }
      })
      .addCase(fetchKYCDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Verify KYC
    builder
      .addCase(verifyKYC.pending, (state) => {
        state.processing = true
      })
      .addCase(verifyKYC.fulfilled, (state, action) => {
        state.processing = false
        if (action.payload) {
          kycAdapter.upsertOne(state, { ...action.payload, status: "verified" })
        }
      })
      .addCase(verifyKYC.rejected, (state, action) => {
        state.processing = false
        state.error = action.payload
      })
    
    // Reject KYC
    builder
      .addCase(rejectKYC.pending, (state) => {
        state.processing = true
      })
      .addCase(rejectKYC.fulfilled, (state, action) => {
        state.processing = false
        if (action.payload) {
          kycAdapter.upsertOne(state, { ...action.payload, status: "rejected" })
        }
      })
      .addCase(rejectKYC.rejected, (state, action) => {
        state.processing = false
        state.error = action.payload
      })
  },
})

export const {
  setSelectedKYC,
  clearSelectedKYC,
  setKYCFilters,
  clearKYCFilters,
  setKYCPagination,
  clearKYCError,
  resetKYC,
} = kycSlice.actions

export const {
  selectAll: selectAllKYCFromAdapter,
  selectById: selectKYCByIdFromAdapter,
  selectIds: selectKYCIds,
} = kycAdapter.getSelectors((state) => state.kyc)

export default kycSlice.reducer
