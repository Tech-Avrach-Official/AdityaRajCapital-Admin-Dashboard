// KYC Thunks - Async actions for KYC management

import { createAsyncThunk } from "@reduxjs/toolkit"
import { kycService } from "@/lib/api/services/kycService"

export const fetchKYCList = createAsyncThunk(
  "kyc/fetchKYCList",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const currentFilters = state.kyc.filters
      const currentPagination = state.kyc.pagination
      
      const queryParams = {
        search: params.search ?? currentFilters.search,
        status: params.status ?? currentFilters.status,
        type: params.type ?? currentFilters.type,
        page: params.page ?? currentPagination.page,
        limit: params.limit ?? currentPagination.limit,
        ...params,
      }
      
      if (queryParams.status === "all") delete queryParams.status
      if (queryParams.type === "all") delete queryParams.type
      
      const result = await kycService.getKYCList(queryParams)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch KYC list")
    }
  }
)

export const fetchKYCDetail = createAsyncThunk(
  "kyc/fetchKYCDetail",
  async (id, { rejectWithValue }) => {
    try {
      const kyc = await kycService.getKYCDetail(id)
      return kyc
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch KYC detail")
    }
  }
)

export const verifyKYC = createAsyncThunk(
  "kyc/verifyKYC",
  async (id, { rejectWithValue }) => {
    try {
      const result = await kycService.verifyKYC(id)
      return { id, ...result }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to verify KYC")
    }
  }
)

export const rejectKYC = createAsyncThunk(
  "kyc/rejectKYC",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const result = await kycService.rejectKYC(id, reason)
      return { id, reason, ...result }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to reject KYC")
    }
  }
)
