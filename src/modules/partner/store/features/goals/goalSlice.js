import { createSlice } from "@reduxjs/toolkit"
import { fetchGoals, deleteGoal, updateGoal } from "./goalThunk"

const initialState = {
  goals: [],
  currentPeriod: null,
  loading: false,
  error: null
}

const goalSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(fetchGoals.pending, (state) => {
        state.loading = true
      })

      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false
        state.goals = action.payload.goals
        state.currentPeriod = action.payload.currentPeriod
      })

      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter(
          g => g.id !== action.payload
        )
      })

      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(
          g => g.id === action.payload.id
        )

        if (index !== -1) {
          state.goals[index] = action.payload
        }
      })

  }
})

export default goalSlice.reducer