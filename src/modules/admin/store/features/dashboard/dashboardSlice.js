// Dashboard Slice - Dashboard metrics and charts state

import { createSlice } from "@reduxjs/toolkit"
import {
  fetchDashboardMetrics,
  fetchDashboardCharts,
  fetchRecentActivity,
} from "./dashboardThunks"

const initialState = {
  // Metrics (summary cards)
  metrics: {
    totalInvestments: 0,
    totalInvestors: 0,
    totalPartners: 0,
    totalRMs: 0,
    pendingKYC: 0,
    pendingPayouts: 0,
    totalCommissions: 0,
    monthlyGrowth: 0,
  },
  metricsLoading: false,
  metricsError: null,
  
  // Charts data
  charts: {
    investmentVolume: [],
    userGrowth: [],
    productDistribution: [],
    commissionTrends: [],
  },
  chartsLoading: false,
  chartsError: null,
  
  // Recent activity
  recentActivity: {
    recentKYC: [],
    recentInvestments: [],
  },
  activityLoading: false,
  activityError: null,
  
  // Last refresh timestamp
  lastRefreshed: null,
  
  // Time range filter for charts
  timeRange: "30d", // "7d", "30d", "90d", "1y"
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.timeRange = action.payload
    },
    clearDashboardErrors: (state) => {
      state.metricsError = null
      state.chartsError = null
      state.activityError = null
    },
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Metrics
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.metricsLoading = true
        state.metricsError = null
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.metricsLoading = false
        state.metrics = { ...state.metrics, ...action.payload }
        state.lastRefreshed = new Date().toISOString()
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.metricsLoading = false
        state.metricsError = action.payload
      })
    
    // Fetch Charts
    builder
      .addCase(fetchDashboardCharts.pending, (state) => {
        state.chartsLoading = true
        state.chartsError = null
      })
      .addCase(fetchDashboardCharts.fulfilled, (state, action) => {
        state.chartsLoading = false
        state.charts = { ...state.charts, ...action.payload }
      })
      .addCase(fetchDashboardCharts.rejected, (state, action) => {
        state.chartsLoading = false
        state.chartsError = action.payload
      })
    
    // Fetch Recent Activity
    builder
      .addCase(fetchRecentActivity.pending, (state) => {
        state.activityLoading = true
        state.activityError = null
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.activityLoading = false
        state.recentActivity = { ...state.recentActivity, ...action.payload }
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.activityLoading = false
        state.activityError = action.payload
      })
  },
})

export const {
  setTimeRange,
  clearDashboardErrors,
  resetDashboard,
} = dashboardSlice.actions

export default dashboardSlice.reducer
