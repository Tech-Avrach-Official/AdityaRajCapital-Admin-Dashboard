// Partner Selectors - Memoized selectors for partner state

import { createSelector } from "@reduxjs/toolkit"
import {
  selectAllPartnersFromAdapter,
  selectPartnerByIdFromAdapter,
} from "./partnerSlice"

const selectPartnerState = (state) => state.partners

export const selectAllPartners = selectAllPartnersFromAdapter

export const selectPartnerById = (id) => (state) =>
  selectPartnerByIdFromAdapter(state, id)

export const selectPartnersLoading = createSelector(
  [selectPartnerState],
  (partners) => partners.loading
)

export const selectPartnersUpdating = createSelector(
  [selectPartnerState],
  (partners) => partners.updating
)

export const selectPartnersError = createSelector(
  [selectPartnerState],
  (partners) => partners.error
)

export const selectPartnerFilters = createSelector(
  [selectPartnerState],
  (partners) => partners.filters
)

export const selectPartnerPagination = createSelector(
  [selectPartnerState],
  (partners) => partners.pagination
)

export const selectSelectedPartner = createSelector(
  [selectPartnerState],
  (partners) => partners.selectedPartner
)

export const selectFilteredPartners = createSelector(
  [selectAllPartnersFromAdapter, selectPartnerFilters],
  (partners, filters) => {
    let filtered = [...partners]
    
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((p) => p.status === filters.status)
    }
    
    if (filters.rmId) {
      filtered = filtered.filter(
        (p) => p.rm_id === filters.rmId || p.rmId === filters.rmId
      )
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(search) ||
          p.email?.toLowerCase().includes(search) ||
          p.partnerId?.toLowerCase().includes(search)
      )
    }
    
    return filtered
  }
)

export const selectPartnersCount = createSelector(
  [selectPartnerState],
  (partners) => partners.pagination.total
)

export const selectPartnersByRM = (rmId) =>
  createSelector([selectAllPartnersFromAdapter], (partners) =>
    partners.filter((p) => p.rm_id === rmId || p.rmId === rmId)
  )
