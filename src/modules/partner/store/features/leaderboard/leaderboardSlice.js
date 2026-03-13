import { createSlice } from "@reduxjs/toolkit"
import { fetchLeaderboard } from "./leaderboardThunk"

const initialState = {
  branch: null,
  state: null,
  overall: null,
  context: null,

  loading: false,
  error: null,
}

const leaderboardSlice = createSlice({
  name: "partnerLeaderboard",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false

        state.branch = action.payload.branch
        state.state = action.payload.state
        state.overall = action.payload.overall
        state.context = action.payload.context
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default leaderboardSlice.reducer