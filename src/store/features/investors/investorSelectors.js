// Investor Selectors

import { createSelector } from "@reduxjs/toolkit"
import { selectAllInvestorsFromAdapter } from "./investorSlice"

const selectInvestorState = (state) => state.investors

export const selectAllInvestors = selectAllInvestorsFromAdapter

export const selectInvestorById = (id) => (state) =>
  state.investors.entities[id]

export const selectInvestorsLoading = createSelector(
  [selectInvestorState],
  (investors) => investors.loading
)

export const selectInvestorsError = createSelector(
  [selectInvestorState],
  (investors) => investors.error
)

export const selectInvestorFilters = createSelector(
  [selectInvestorState],
  (investors) => investors.filters
)

export const selectInvestorPagination = createSelector(
  [selectInvestorState],
  (investors) => investors.pagination
)

export const selectSelectedInvestor = createSelector(
  [selectInvestorState],
  (investors) => investors.selectedInvestor
)

export const selectFilteredInvestors = createSelector(
  [selectAllInvestorsFromAdapter, selectInvestorFilters],
  (investors, filters) => {
    let filtered = [...investors]
    
    if (filters.kycStatus && filters.kycStatus !== "all") {
      filtered = filtered.filter((i) => i.kycStatus === filters.kycStatus)
    }
    
    if (filters.partnerId) {
      filtered = filtered.filter((i) => i.partnerId === filters.partnerId)
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.name?.toLowerCase().includes(search) ||
          i.email?.toLowerCase().includes(search) ||
          i.investorId?.toLowerCase().includes(search)
      )
    }
    
    return filtered
  }
)

export const selectInvestorsCount = createSelector(
  [selectInvestorState],
  (investors) => investors.pagination.total
)
