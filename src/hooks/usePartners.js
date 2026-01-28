// usePartners Hook - Partner management utilities

import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  selectAllPartners,
  selectPartnersLoading,
  selectPartnersUpdating,
  selectPartnersError,
  selectPartnerFilters,
  selectPartnerPagination,
  selectSelectedPartner,
  selectFilteredPartners,
  selectPartnersCount,
} from "@/store/features/partners/partnerSelectors"
import {
  fetchPartners,
  fetchPartnerById,
  changePartnerRM,
} from "@/store/features/partners/partnerThunks"
import {
  setSelectedPartner,
  clearSelectedPartner,
  setPartnerFilters,
  clearPartnerFilters,
  setPartnerPagination,
  clearPartnerError,
  resetPartners,
} from "@/store/features/partners/partnerSlice"

/**
 * Custom hook for partner management
 */
export const usePartners = () => {
  const dispatch = useAppDispatch()
  
  // Selectors
  const partners = useAppSelector(selectAllPartners)
  const filteredPartners = useAppSelector(selectFilteredPartners)
  const selectedPartner = useAppSelector(selectSelectedPartner)
  const loading = useAppSelector(selectPartnersLoading)
  const updating = useAppSelector(selectPartnersUpdating)
  const error = useAppSelector(selectPartnersError)
  const filters = useAppSelector(selectPartnerFilters)
  const pagination = useAppSelector(selectPartnerPagination)
  const totalCount = useAppSelector(selectPartnersCount)
  
  // Actions
  const loadPartners = useCallback(
    (params) => dispatch(fetchPartners(params)),
    [dispatch]
  )
  
  const loadPartnerById = useCallback(
    (id) => dispatch(fetchPartnerById(id)),
    [dispatch]
  )
  
  const changeRM = useCallback(
    async (partnerId, rmId) => {
      const result = await dispatch(changePartnerRM({ partnerId, rmId }))
      return result
    },
    [dispatch]
  )
  
  const selectPartner = useCallback(
    (partner) => dispatch(setSelectedPartner(partner)),
    [dispatch]
  )
  
  const deselectPartner = useCallback(
    () => dispatch(clearSelectedPartner()),
    [dispatch]
  )
  
  const updateFilters = useCallback(
    (newFilters) => dispatch(setPartnerFilters(newFilters)),
    [dispatch]
  )
  
  const resetFilters = useCallback(
    () => dispatch(clearPartnerFilters()),
    [dispatch]
  )
  
  const updatePagination = useCallback(
    (newPagination) => dispatch(setPartnerPagination(newPagination)),
    [dispatch]
  )
  
  const clearError = useCallback(
    () => dispatch(clearPartnerError()),
    [dispatch]
  )
  
  const reset = useCallback(
    () => dispatch(resetPartners()),
    [dispatch]
  )
  
  return {
    // State
    partners,
    filteredPartners,
    selectedPartner,
    loading,
    updating,
    error,
    filters,
    pagination,
    totalCount,
    
    // Actions
    loadPartners,
    loadPartnerById,
    changeRM,
    selectPartner,
    deselectPartner,
    updateFilters,
    resetFilters,
    updatePagination,
    clearError,
    reset,
  }
}

export default usePartners
