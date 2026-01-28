// KYC Selectors

import { createSelector } from "@reduxjs/toolkit"
import { selectAllKYCFromAdapter } from "./kycSlice"

const selectKYCState = (state) => state.kyc

export const selectAllKYC = selectAllKYCFromAdapter

export const selectKYCById = (id) => (state) => state.kyc.entities[id]

export const selectKYCLoading = createSelector(
  [selectKYCState],
  (kyc) => kyc.loading
)

export const selectKYCProcessing = createSelector(
  [selectKYCState],
  (kyc) => kyc.processing
)

export const selectKYCError = createSelector(
  [selectKYCState],
  (kyc) => kyc.error
)

export const selectKYCFilters = createSelector(
  [selectKYCState],
  (kyc) => kyc.filters
)

export const selectKYCPagination = createSelector(
  [selectKYCState],
  (kyc) => kyc.pagination
)

export const selectSelectedKYC = createSelector(
  [selectKYCState],
  (kyc) => kyc.selectedKYC
)

export const selectFilteredKYC = createSelector(
  [selectAllKYCFromAdapter, selectKYCFilters],
  (kycList, filters) => {
    let filtered = [...kycList]
    
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((k) => k.status === filters.status)
    }
    
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((k) => k.type === filters.type)
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (k) =>
          k.name?.toLowerCase().includes(search) ||
          k.email?.toLowerCase().includes(search) ||
          k.mobile?.includes(search)
      )
    }
    
    return filtered
  }
)

export const selectPendingKYCCount = createSelector(
  [selectAllKYCFromAdapter],
  (kycList) => kycList.filter((k) => k.status === "pending").length
)

export const selectKYCStats = createSelector(
  [selectAllKYCFromAdapter],
  (kycList) => ({
    total: kycList.length,
    pending: kycList.filter((k) => k.status === "pending").length,
    verified: kycList.filter((k) => k.status === "verified").length,
    rejected: kycList.filter((k) => k.status === "rejected").length,
  })
)
