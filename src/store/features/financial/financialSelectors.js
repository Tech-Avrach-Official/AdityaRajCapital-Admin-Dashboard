// Financial Selectors

import { createSelector } from "@reduxjs/toolkit"
import {
  investmentsSelectors,
  payoutsSelectors,
  commissionsSelectors,
} from "./financialSlice"

const selectFinancialState = (state) => state.financial

// Investments
export const selectAllInvestments = investmentsSelectors.selectAll
export const selectInvestmentById = (id) => (state) =>
  investmentsSelectors.selectById(state, id)

export const selectInvestmentsLoading = createSelector(
  [selectFinancialState],
  (financial) => financial.investments.loading
)

export const selectInvestmentsError = createSelector(
  [selectFinancialState],
  (financial) => financial.investments.error
)

export const selectInvestmentFilters = createSelector(
  [selectFinancialState],
  (financial) => financial.investments.filters
)

export const selectInvestmentPagination = createSelector(
  [selectFinancialState],
  (financial) => financial.investments.pagination
)

export const selectSelectedInvestment = createSelector(
  [selectFinancialState],
  (financial) => financial.selectedInvestment
)

// Payouts
export const selectAllPayouts = payoutsSelectors.selectAll
export const selectPayoutById = (id) => (state) =>
  payoutsSelectors.selectById(state, id)

export const selectPayoutsLoading = createSelector(
  [selectFinancialState],
  (financial) => financial.payouts.loading
)

export const selectPayoutsUploading = createSelector(
  [selectFinancialState],
  (financial) => financial.payouts.uploading
)

export const selectPayoutsError = createSelector(
  [selectFinancialState],
  (financial) => financial.payouts.error
)

export const selectPayoutFilters = createSelector(
  [selectFinancialState],
  (financial) => financial.payouts.filters
)

export const selectPayoutPagination = createSelector(
  [selectFinancialState],
  (financial) => financial.payouts.pagination
)

export const selectSelectedPayout = createSelector(
  [selectFinancialState],
  (financial) => financial.selectedPayout
)

// Commissions
export const selectAllCommissions = commissionsSelectors.selectAll
export const selectCommissionById = (id) => (state) =>
  commissionsSelectors.selectById(state, id)

export const selectCommissionsLoading = createSelector(
  [selectFinancialState],
  (financial) => financial.commissions.loading
)

export const selectCommissionsError = createSelector(
  [selectFinancialState],
  (financial) => financial.commissions.error
)

export const selectCommissionFilters = createSelector(
  [selectFinancialState],
  (financial) => financial.commissions.filters
)

export const selectCommissionPagination = createSelector(
  [selectFinancialState],
  (financial) => financial.commissions.pagination
)

export const selectSelectedCommission = createSelector(
  [selectFinancialState],
  (financial) => financial.selectedCommission
)
