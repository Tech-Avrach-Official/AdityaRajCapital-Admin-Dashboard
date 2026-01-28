// Dashboard Selectors

import { createSelector } from "@reduxjs/toolkit"

const selectDashboardState = (state) => state.dashboard

// Metrics
export const selectDashboardMetrics = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.metrics
)

export const selectMetricsLoading = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.metricsLoading
)

export const selectMetricsError = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.metricsError
)

// Charts
export const selectDashboardCharts = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.charts
)

export const selectChartsLoading = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.chartsLoading
)

export const selectChartsError = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.chartsError
)

export const selectInvestmentVolumeChart = createSelector(
  [selectDashboardCharts],
  (charts) => charts.investmentVolume
)

export const selectUserGrowthChart = createSelector(
  [selectDashboardCharts],
  (charts) => charts.userGrowth
)

export const selectProductDistributionChart = createSelector(
  [selectDashboardCharts],
  (charts) => charts.productDistribution
)

export const selectCommissionTrendsChart = createSelector(
  [selectDashboardCharts],
  (charts) => charts.commissionTrends
)

// Recent Activity
export const selectRecentActivity = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.recentActivity
)

export const selectActivityLoading = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.activityLoading
)

export const selectRecentKYC = createSelector(
  [selectRecentActivity],
  (activity) => activity.recentKYC
)

export const selectRecentInvestments = createSelector(
  [selectRecentActivity],
  (activity) => activity.recentInvestments
)

// Time range
export const selectTimeRange = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.timeRange
)

// Last refreshed
export const selectLastRefreshed = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.lastRefreshed
)

// Combined loading state
export const selectDashboardLoading = createSelector(
  [selectDashboardState],
  (dashboard) =>
    dashboard.metricsLoading ||
    dashboard.chartsLoading ||
    dashboard.activityLoading
)

// Any error state
export const selectDashboardHasError = createSelector(
  [selectDashboardState],
  (dashboard) =>
    !!dashboard.metricsError ||
    !!dashboard.chartsError ||
    !!dashboard.activityError
)
