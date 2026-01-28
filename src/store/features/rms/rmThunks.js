// RM Thunks - Async actions for RM management
// Handles all API calls related to Relationship Managers

import { createAsyncThunk } from "@reduxjs/toolkit"
import { usersService } from "@/lib/api/services/usersService"

/**
 * Fetch all RMs with optional filters and pagination
 */
export const fetchRMs = createAsyncThunk(
  "rms/fetchRMs",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      // Get current filters from state if not provided
      const state = getState()
      const currentFilters = state.rms.filters
      const currentPagination = state.rms.pagination
      
      const queryParams = {
        search: params.search ?? currentFilters.search,
        status: params.status ?? currentFilters.status,
        page: params.page ?? currentPagination.page,
        limit: params.limit ?? currentPagination.limit,
        ...params,
      }
      
      // Remove "all" status as it means no filter
      if (queryParams.status === "all") {
        delete queryParams.status
      }
      
      const result = await usersService.getRMs(queryParams)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch RMs")
    }
  }
)

/**
 * Fetch single RM by ID
 */
export const fetchRMById = createAsyncThunk(
  "rms/fetchRMById",
  async (id, { rejectWithValue }) => {
    try {
      const rm = await usersService.getRM(id)
      return rm
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch RM details")
    }
  }
)

/**
 * Create new RM
 * Accepts FormData for file uploads
 */
export const createRM = createAsyncThunk(
  "rms/createRM",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await usersService.createRM(formData)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to create RM")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create RM")
    }
  }
)

/**
 * Update existing RM
 */
export const updateRM = createAsyncThunk(
  "rms/updateRM",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await usersService.updateRM(id, data)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to update RM")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update RM")
    }
  }
)

/**
 * Delete RM
 * Will fail if RM has linked partners
 */
export const deleteRM = createAsyncThunk(
  "rms/deleteRM",
  async (id, { rejectWithValue }) => {
    try {
      const result = await usersService.deleteRM(id)
      if (result.success) {
        return id
      }
      return rejectWithValue(result.message || "Failed to delete RM")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete RM")
    }
  }
)

/**
 * Validate RM code
 * Used for partner signup validation
 */
export const validateRMCode = createAsyncThunk(
  "rms/validateRMCode",
  async (code, { rejectWithValue }) => {
    try {
      const result = await usersService.validateRMCode(code)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Invalid RM code")
    } catch (error) {
      return rejectWithValue(error.message || "Invalid RM code")
    }
  }
)

/**
 * Fetch RM's linked partners
 */
export const fetchRMPartners = createAsyncThunk(
  "rms/fetchRMPartners",
  async (rmId, { rejectWithValue }) => {
    try {
      const result = await usersService.getRMPartners(rmId)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to fetch RM partners")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch RM partners")
    }
  }
)

// =====================
// OTP Flow Thunks
// =====================

/**
 * Step 1: Initiate RM signup with OTP verification
 */
export const initiateRMSignup = createAsyncThunk(
  "rms/initiateRMSignup",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await usersService.initiateRMSignup(formData)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to initiate signup")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to initiate signup")
    }
  }
)

/**
 * Step 2: Verify mobile OTP
 */
export const verifyMobileOtp = createAsyncThunk(
  "rms/verifyMobileOtp",
  async ({ signupRequestId, otp }, { rejectWithValue }) => {
    try {
      const result = await usersService.verifyMobileOtp(signupRequestId, otp)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Invalid mobile OTP")
    } catch (error) {
      return rejectWithValue(error.message || "Invalid mobile OTP")
    }
  }
)

/**
 * Step 3: Verify email OTP
 */
export const verifyEmailOtp = createAsyncThunk(
  "rms/verifyEmailOtp",
  async ({ signupRequestId, otp }, { rejectWithValue }) => {
    try {
      const result = await usersService.verifyEmailOtp(signupRequestId, otp)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Invalid email OTP")
    } catch (error) {
      return rejectWithValue(error.message || "Invalid email OTP")
    }
  }
)

/**
 * Step 4: Complete RM creation after OTP verification
 */
export const completeRMSignup = createAsyncThunk(
  "rms/completeRMSignup",
  async (signupRequestId, { rejectWithValue }) => {
    try {
      const result = await usersService.completeRMSignup(signupRequestId)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to complete signup")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to complete signup")
    }
  }
)

/**
 * Resend mobile OTP
 */
export const resendMobileOtp = createAsyncThunk(
  "rms/resendMobileOtp",
  async (signupRequestId, { rejectWithValue }) => {
    try {
      const result = await usersService.resendMobileOtp(signupRequestId)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to resend OTP")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to resend OTP")
    }
  }
)

/**
 * Resend email OTP
 */
export const resendEmailOtp = createAsyncThunk(
  "rms/resendEmailOtp",
  async (signupRequestId, { rejectWithValue }) => {
    try {
      const result = await usersService.resendEmailOtp(signupRequestId)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to resend OTP")
    } catch (error) {
      return rejectWithValue(error.message || "Failed to resend OTP")
    }
  }
)
