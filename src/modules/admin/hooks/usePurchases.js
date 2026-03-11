// usePurchases Hook - Payment verification management (admin module)

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
} from "@/modules/admin/store/features/purchases/purchaseSelectors"
import {
  fetchPendingVerifications,
  verifyPayment as verifyPaymentThunk,
  rejectPayment as rejectPaymentThunk,
} from "@/modules/admin/store/features/purchases/purchaseThunks"
import {
  setSelectedPurchase,
  clearSelectedPurchase,
  setPurchaseFilters,
  clearPurchaseFilters,
  clearPurchaseError,
  resetPurchases,
} from "@/modules/admin/store/features/purchases/purchaseSlice"

/**
 * Custom hook for payment verification management
 */
export const usePurchases = () => {
  const dispatch = useAppDispatch()

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

  const loadPending = useCallback(
    (params) => dispatch(fetchPendingVerifications(params)),
    [dispatch]
  )
  const verifyPayment = useCallback(
    async (purchaseId, cheque_number) => {
      const result = await dispatch(verifyPaymentThunk({ purchaseId, cheque_number }))
      return result
    },
    [dispatch]
  )
  const rejectPayment = useCallback(
    async (purchaseId, reason = "") => {
      const result = await dispatch(rejectPaymentThunk({ purchaseId, reason }))
      return result
    },
    [dispatch]
  )
  const selectPurchase = useCallback((purchase) => dispatch(setSelectedPurchase(purchase)), [dispatch])
  const deselectPurchase = useCallback(() => dispatch(clearSelectedPurchase()), [dispatch])
  const updateFilters = useCallback((newFilters) => dispatch(setPurchaseFilters(newFilters)), [dispatch])
  const resetFilters = useCallback(() => dispatch(clearPurchaseFilters()), [dispatch])
  const clearError = useCallback(() => dispatch(clearPurchaseError()), [dispatch])
  const reset = useCallback(() => dispatch(resetPurchases()), [dispatch])
  const isPurchaseProcessing = useCallback((purchaseId) => processingId === purchaseId, [processingId])

  return {
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
