import { createAsyncThunk } from "@reduxjs/toolkit"
import { dashboardService } from "@/modules/partner/api/services/dashboardService"

export const fetchCommissionSummary = createAsyncThunk(
  "partnerDashboard/fetchCommissionSummary",
  async (_, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getCommissionSummary()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchInvestorSummary = createAsyncThunk(
  "partnerDashboard/fetchInvestorSummary",
  async (_, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getInvestorSummary()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchPartnerDashboardData = createAsyncThunk(
  "partnerDashboard/fetchAll",
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchCommissionSummary()),
      dispatch(fetchInvestorSummary()),
    ])
  }
)


export const fetchCommissionHistory = createAsyncThunk(
  "partnerDashboard/fetchCommissionHistory",
  async (params, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getCommissionHistory(params)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)