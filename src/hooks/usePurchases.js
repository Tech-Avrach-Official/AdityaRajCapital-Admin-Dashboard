// usePurchases Hook - Payment verification management utilities

import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  selectAllPurchases,
  selectPurchasesLoading,
  selectPurchaseVerifying,
  selectPurchaseRejecting,
  selectProcessingId,
  selectPurchaseOperationInProgress,
  selectPurchasesError,
  selectPurchaseFilters,
  selectPendingCount,
  selectSelectedPurchase,
  selectFilteredPurchases,
  selectPurchasesSummary,
} from "@/store/features/purchases/purchaseSelectors"
import {
  fetchPendingVerifications,
  verifyPayment as verifyPaymentThunk,
  rejectPayment as rejectPaymentThunk,
} from "@/store/features/purchases/purchaseThunks"
import {
  setSelectedPurchase,
  clearSelectedPurchase,
  setPurchaseFilters,
  clearPurchaseFilters,
  clearPurchaseError,
  resetPurchases,
} from "@/store/features/purchases/purchaseSlice"

/**
 * Custom hook for payment verification management
 */
export const usePurchases = () => {
  const dispatch = useAppDispatch()

  // Selectors
  const pendingPurchases = useAppSelector(selectAllPurchases)
  const filteredPurchases = useAppSelector(selectFilteredPurchases)
  const loading = useAppSelector(selectPurchasesLoading)
  const verifying = useAppSelector(selectPurchaseVerifying)
  const rejecting = useAppSelector(selectPurchaseRejecting)
  const processingId = useAppSelector(selectProcessingId)
  const operationInProgress = useAppSelector(selectPurchaseOperationInProgress)
  const error = useAppSelector(selectPurchasesError)
  const filters = useAppSelector(selectPurchaseFilters)
  const pendingCount = useAppSelector(selectPendingCount)
  const selectedPurchase = useAppSelector(selectSelectedPurchase)
  const summary = useAppSelector(selectPurchasesSummary)

  // Load pending verifications
  const loadPending = useCallback(
    (params) => dispatch(fetchPendingVerifications(params)),
    [dispatch]
  )

  // Verify (approve) a payment
  const verifyPayment = useCallback(
    async (purchaseId) => {
      const result = await dispatch(verifyPaymentThunk(purchaseId))
      return result
    },
    [dispatch]
  )

  // Reject a payment with optional reason
  const rejectPayment = useCallback(
    async (purchaseId, reason = "") => {
      const result = await dispatch(rejectPaymentThunk({ purchaseId, reason }))
      return result
    },
    [dispatch]
  )

  // Select a purchase (for viewing proof or rejecting)
  const selectPurchase = useCallback(
    (purchase) => dispatch(setSelectedPurchase(purchase)),
    [dispatch]
  )

  // Clear selected purchase
  const deselectPurchase = useCallback(
    () => dispatch(clearSelectedPurchase()),
    [dispatch]
  )

  // Update filters
  const updateFilters = useCallback(
    (newFilters) => dispatch(setPurchaseFilters(newFilters)),
    [dispatch]
  )

  // Reset filters
  const resetFilters = useCallback(
    () => dispatch(clearPurchaseFilters()),
    [dispatch]
  )

  // Clear error
  const clearError = useCallback(
    () => dispatch(clearPurchaseError()),
    [dispatch]
  )

  // Reset all state
  const reset = useCallback(
    () => dispatch(resetPurchases()),
    [dispatch]
  )

  // Check if a specific purchase is being processed
  const isPurchaseProcessing = useCallback(
    (purchaseId) => processingId === purchaseId,
    [processingId]
  )

  return {
    // State
    pendingPurchases,
    filteredPurchases,
    loading,
    verifying,
    rejecting,
    processingId,
    operationInProgress,
    error,
    filters,
    pendingCount,
    selectedPurchase,
    summary,

    // Actions
    loadPending,
    verifyPayment,
    rejectPayment,
    selectPurchase,
    deselectPurchase,
    updateFilters,
    resetFilters,
    clearError,
    reset,
    isPurchaseProcessing,
  }
}

export default usePurchases
