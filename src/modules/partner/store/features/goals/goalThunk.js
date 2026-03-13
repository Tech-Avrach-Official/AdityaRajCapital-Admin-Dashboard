import { createAsyncThunk } from "@reduxjs/toolkit"
import { goalService } from "@/modules/partner/api/services/goalService"

export const fetchGoals = createAsyncThunk(
  "goals/fetchGoals",
  async (_, { rejectWithValue }) => {
    try {
      return await goalService.getCurrentGoals()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteGoal = createAsyncThunk(
  "goals/deleteGoal",
  async (id, { rejectWithValue }) => {
    try {
      await goalService.deleteGoal(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateGoal = createAsyncThunk(
  "goals/updateGoal",
  async (payload, { rejectWithValue }) => {
    try {
      return await goalService.updateGoal(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)