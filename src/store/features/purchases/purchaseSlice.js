// Purchase Slice - Payment verification state management
// Uses entity adapter for normalized state

import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import {
  fetchPendingVerifications,
  verifyPayment,
  rejectPayment,
} from "./purchaseThunks"

/**
 * Entity adapter for normalized purchase state
 * Provides CRUD operations and selectors
 */
const purchasesAdapter = createEntityAdapter({
  selectId: (purchase) => purchase.id,
  sortComparer: (a, b) => {
    // Sort by payment_proof_uploaded_at descending (newest first)
    const dateA = new Date(a.payment_proof_uploaded_at || a.created_at || 0)
    const dateB = new Date(b.payment_proof_uploaded_at || b.created_at || 0)
    return dateB - dateA
  },
})

/**
 * Initial state with entity adapter
 */
const initialState = purchasesAdapter.getInitialState({
  // Loading states
  loading: false,
  verifying: false,
  rejecting: false,

  // Error state
  error: null,

  // Filters
  filters: {
    search: "",
  },

  // Total count from API
  total: 0,

  // Selected purchase for modals
  selectedPurchase: null,

  // Track action in progress (purchaseId being processed)
  processingId: null,
})

/**
 * Purchase Slice
 */
const purchaseSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {
    // Set selected purchase (for viewing proof or rejecting)
    setSelectedPurchase: (state, action) => {
      state.selectedPurchase = action.payload
    },

    // Clear selected purchase
    clearSelectedPurchase: (state) => {
      state.selectedPurchase = null
    },

    // Set filters
    setPurchaseFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    // Clear filters
    clearPurchaseFilters: (state) => {
      state.filters = initialState.filters
    },

    // Clear error
    clearPurchaseError: (state) => {
      state.error = null
    },

    // Reset state
    resetPurchases: () => initialState,
  },
  extraReducers: (builder) => {
    // ============ Fetch Pending Verifications ============
    builder
      .addCase(fetchPendingVerifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingVerifications.fulfilled, (state, action) => {
        state.loading = false
        purchasesAdapter.setAll(state, action.payload.data)
        state.total = action.payload.total
      })
      .addCase(fetchPendingVerifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ============ Verify Payment ============
    builder
      .addCase(verifyPayment.pending, (state, action) => {
        state.verifying = true
        state.processingId = action.meta.arg // purchaseId
        state.error = null
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verifying = false
        state.processingId = null
        // Remove the verified purchase from the list
        purchasesAdapter.removeOne(state, action.payload.purchase_id)
        state.total = Math.max(0, state.total - 1)
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifying = false
        state.processingId = null
        state.error = action.payload
      })

    // ============ Reject Payment ============
    builder
      .addCase(rejectPayment.pending, (state, action) => {
        state.rejecting = true
        state.processingId = action.meta.arg.purchaseId
        state.error = null
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        state.rejecting = false
        state.processingId = null
        // Remove the rejected purchase from the list
        purchasesAdapter.removeOne(state, action.payload.purchase_id)
        state.total = Math.max(0, state.total - 1)
        // Clear selected purchase
        state.selectedPurchase = null
      })
      .addCase(rejectPayment.rejected, (state, action) => {
        state.rejecting = false
        state.processingId = null
        state.error = action.payload
      })
  },
})

// Export actions
export const {
  setSelectedPurchase,
  clearSelectedPurchase,
  setPurchaseFilters,
  clearPurchaseFilters,
  clearPurchaseError,
  resetPurchases,
} = purchaseSlice.actions

// Export adapter selectors
export const {
  selectAll: selectAllPurchasesFromAdapter,
  selectById: selectPurchaseByIdFromAdapter,
  selectIds: selectPurchaseIds,
  selectEntities: selectPurchaseEntities,
  selectTotal: selectPurchaseTotal,
} = purchasesAdapter.getSelectors((state) => state.purchases)

// Export reducer
export default purchaseSlice.reducer
