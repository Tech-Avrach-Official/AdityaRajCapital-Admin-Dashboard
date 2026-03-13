import { createAsyncThunk } from "@reduxjs/toolkit"
import { leaderboardService } from "@/modules/partner/api/services/leaderboardService"

export const fetchLeaderboard = createAsyncThunk(
  "partnerLeaderboard/fetchLeaderboard",
  async (_, { rejectWithValue }) => {
    try {
      const data = await leaderboardService.getLeaderboard()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)