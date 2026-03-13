import { createAsyncThunk } from "@reduxjs/toolkit"
import { dashboardService } from "@/modules/rm/api/services/dashboardServices"

export const fetchRMReport = createAsyncThunk(
  "rmDashboard/fetchReport",
  async (period, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getReport(period)
      return data
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch RM report")
    }
  }
)