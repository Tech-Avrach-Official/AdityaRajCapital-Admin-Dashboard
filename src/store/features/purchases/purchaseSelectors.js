// Purchase Selectors - Memoized selectors for payment verification state
// Provides efficient access to purchase data in components

import { createSelector } from "@reduxjs/toolkit"
import {
  selectAllPurchasesFromAdapter,
  selectPurchaseByIdFromAdapter,
} from "./purchaseSlice"

/**
 * Base selector - gets purchases slice
 */
const selectPurchaseState = (state) => state.purchases

/**
 * Select all purchases as array
 */
export const selectAllPurchases = selectAllPurchasesFromAdapter

/**
 * Select purchase by ID
 */
export const selectPurchaseById = (id) => (state) =>
  selectPurchaseByIdFromAdapter(state, id)

/**
 * Select loading state
 */
export const selectPurchasesLoading = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.loading
)

/**
 * Select verifying state (approve action in progress)
 */
export const selectPurchaseVerifying = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.verifying
)

/**
 * Select rejecting state (reject action in progress)
 */
export const selectPurchaseRejecting = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.rejecting
)

/**
 * Select processing ID (which purchase is being verified/rejected)
 */
export const selectProcessingId = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.processingId
)

/**
 * Select any operation in progress
 */
export const selectPurchaseOperationInProgress = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.loading || purchases.verifying || purchases.rejecting
)

/**
 * Select error
 */
export const selectPurchasesError = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.error
)

/**
 * Select filters
 */
export const selectPurchaseFilters = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.filters
)

/**
 * Select total pending count
 */
export const selectPendingCount = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.total
)

/**
 * Select selected purchase (for modals)
 */
export const selectSelectedPurchase = createSelector(
  [selectPurchaseState],
  (purchases) => purchases.selectedPurchase
)

/**
 * Select filtered purchases based on current filters (client-side filtering)
 */
export const selectFilteredPurchases = createSelector(
  [selectAllPurchasesFromAdapter, selectPurchaseFilters],
  (purchases, filters) => {
    let filtered = [...purchases]

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          String(p.id ?? "").toLowerCase().includes(search) ||
          String(p.investor_id ?? "").toLowerCase().includes(search) ||
          p.investor_name?.toLowerCase().includes(search) ||
          p.plan_name?.toLowerCase().includes(search) ||
          String(p.amount ?? "").includes(search)
      )
    }

    return filtered
  }
)

/**
 * Check if a specific purchase is being processed
 */
export const selectIsPurchaseProcessing = (purchaseId) =>
  createSelector([selectProcessingId], (processingId) => processingId === purchaseId)

/**
 * Select purchases summary for metrics
 */
export const selectPurchasesSummary = createSelector(
  [selectAllPurchasesFromAdapter, selectPendingCount],
  (purchases, total) => {
    const list = Array.isArray(purchases) ? purchases : []
    const totalAmount = list.reduce((sum, p) => {
      const amt = Number(p?.amount)
      return sum + (Number.isFinite(amt) ? amt : 0)
    }, 0)
    return {
      pendingCount: total ?? 0,
      totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
    }
  }
)
