// Purchase Thunks - Async actions for payment verification
// Handles all API calls related to purchase payment verification

import { createAsyncThunk } from "@reduxjs/toolkit"
import { purchasesService } from "@/lib/api/services/purchasesService"

/**
 * Fetch pending payment verifications
 */
export const fetchPendingVerifications = createAsyncThunk(
  "purchases/fetchPendingVerifications",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      // Get current filters from state if not provided
      const state = getState()
      const currentFilters = state.purchases.filters

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
 * Verify (approve) a payment
 */
export const verifyPayment = createAsyncThunk(
  "purchases/verifyPayment",
  async (purchaseId, { rejectWithValue }) => {
    try {
      const result = await purchasesService.verifyPayment(purchaseId)
      if (result.success) {
        return result.data
      }
      return rejectWithValue(result.message || "Failed to verify payment")
    } catch (error) {
      // Handle specific error codes
      if (error.code === "PURCHASE_INVALID_STATUS") {
        return rejectWithValue("This payment cannot be verified in its current status")
      }
      return rejectWithValue(error.message || "Failed to verify payment")
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
      return rejectWithValue(result.message || "Failed to reject payment")
    } catch (error) {
      // Handle specific error codes
      if (error.code === "PURCHASE_INVALID_STATUS") {
        return rejectWithValue("This payment cannot be rejected in its current status")
      }
      return rejectWithValue(error.message || "Failed to reject payment")
    }
  }
)
