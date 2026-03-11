// Purchase Thunks - Async actions for payment verification
// Handles all API calls related to purchase payment verification

import { createAsyncThunk } from "@reduxjs/toolkit"
import { purchasesService } from "@/modules/admin/api/services/purchasesService"

/**
 * Fetch pending payment verifications
 */
export const fetchPendingVerifications = createAsyncThunk(
  "purchases/fetchPendingVerifications",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      // Get current filters from state if not provided
      const state = getState()
      const currentFilters = state.admin.purchases.filters

      const queryParams = {
        search: params.search ?? currentFilters.search,
        ...params,
      }

      const result = await purchasesService.getPendingVerifications(queryParams)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch pending verifications")
    }
  }
)

/**
 * Verify (approve) a payment - requires cheque_number
 */
export const verifyPayment = createAsyncThunk(
  "purchases/verifyPayment",
  async ({ purchaseId, cheque_number }, { rejectWithValue }) => {
    try {
      const result = await purchasesService.verifyPayment(purchaseId, { cheque_number })
      if (result.success) {
        return result.data
      }
      return rejectWithValue({
        message: result.message || "Failed to verify payment",
        error_code: result.error_code,
      })
    } catch (error) {
      const data = error.response?.data
      const message = data?.message || error.message || "Failed to verify payment"
      const error_code = data?.error_code || error.error_code
      return rejectWithValue({ message, error_code })
    }
  }
)

/**
 * Reject a payment with optional reason
 */
export const rejectPayment = createAsyncThunk(
  "purchases/rejectPayment",
  async ({ purchaseId, reason }, { rejectWithValue }) => {
    try {
      const result = await purchasesService.rejectPayment(purchaseId, { reason })
      if (result.success) {
        return result.data
      }
      return rejectWithValue({
        message: result.message || "Failed to reject payment",
        error_code: result.error_code,
      })
    } catch (error) {
      const data = error.response?.data
      const message = data?.message || error.message || "Failed to reject payment"
      const error_code = data?.error_code || error.error_code
      return rejectWithValue({ message, error_code })
    }
  }
)
