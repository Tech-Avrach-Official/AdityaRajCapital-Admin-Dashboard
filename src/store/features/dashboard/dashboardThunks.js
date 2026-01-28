// Dashboard Thunks - Async actions for dashboard data

import { createAsyncThunk } from "@reduxjs/toolkit"
import { dashboardService } from "@/lib/api/services/dashboardService"

export const fetchDashboardMetrics = createAsyncThunk(
  "dashboard/fetchMetrics",
  async (_, { rejectWithValue }) => {
    try {
      const metrics = await dashboardService.getMetrics()
      return metrics
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch metrics")
    }
  }
)

export const fetchDashboardCharts = createAsyncThunk(
  "dashboard/fetchCharts",
  async (timeRange, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const range = timeRange || state.dashboard.timeRange
      const charts = await dashboardService.getCharts(range)
      return charts
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch charts")
    }
  }
)

export const fetchRecentActivity = createAsyncThunk(
  "dashboard/fetchRecentActivity",
  async (_, { rejectWithValue }) => {
    try {
      const activity = await dashboardService.getRecentActivity()
      return activity
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch recent activity")
    }
  }
)

/**
 * Combined thunk to fetch all dashboard data
 */
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchAll",
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchDashboardMetrics()),
      dispatch(fetchDashboardCharts()),
      dispatch(fetchRecentActivity()),
    ])
  }
)
