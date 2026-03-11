// Investor Thunks - Async actions for investor management

import { createAsyncThunk } from "@reduxjs/toolkit"
import { usersService } from "@/modules/admin/api/services/usersService"

export const fetchInvestors = createAsyncThunk(
  "investors/fetchInvestors",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const currentFilters = state.admin.investors.filters
      const currentPagination = state.admin.investors.pagination
      
      const queryParams = {
        search: params.search ?? currentFilters.search,
        kycStatus: params.kycStatus ?? currentFilters.kycStatus,
        partnerId: params.partnerId ?? currentFilters.partnerId,
        page: params.page ?? currentPagination.page,
        limit: params.limit ?? currentPagination.limit,
        ...params,
      }
      
      if (queryParams.kycStatus === "all") delete queryParams.kycStatus
      
      const result = await usersService.getInvestors(queryParams)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch investors")
    }
  }
)

export const fetchInvestorById = createAsyncThunk(
  "investors/fetchInvestorById",
  async (id, { rejectWithValue }) => {
    try {
      const investor = await usersService.getInvestor(id)
      return investor
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch investor")
    }
  }
)
