// Partner Thunks - Async actions for partner management

import { createAsyncThunk } from "@reduxjs/toolkit"
import { usersService } from "@/lib/api/services/usersService"

/**
 * Fetch all partners with optional filters
 */
export const fetchPartners = createAsyncThunk(
  "partners/fetchPartners",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const currentFilters = state.partners.filters
      const currentPagination = state.partners.pagination
      
      const queryParams = {
        search: params.search ?? currentFilters.search,
        status: params.status ?? currentFilters.status,
        rmId: params.rmId ?? currentFilters.rmId,
        kycStatus: params.kycStatus ?? currentFilters.kycStatus,
        page: params.page ?? currentPagination.page,
        limit: params.limit ?? currentPagination.limit,
        ...params,
      }
      
      // Remove "all" values
      if (queryParams.status === "all") delete queryParams.status
      if (queryParams.kycStatus === "all") delete queryParams.kycStatus
      
      const result = await usersService.getPartners(queryParams)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch partners")
    }
  }
)

/**
 * Fetch single partner by ID
 */
export const fetchPartnerById = createAsyncThunk(
  "partners/fetchPartnerById",
  async (id, { rejectWithValue }) => {
    try {
      const partner = await usersService.getPartner(id)
      return partner
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch partner")
    }
  }
)

/**
 * Change partner's assigned RM
 */
export const changePartnerRM = createAsyncThunk(
  "partners/changePartnerRM",
  async ({ partnerId, rmId }, { rejectWithValue }) => {
    try {
      const result = await usersService.changePartnerRM(partnerId, rmId)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to change RM")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to change RM")
    }
  }
)
