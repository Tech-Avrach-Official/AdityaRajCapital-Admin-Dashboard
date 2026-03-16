import { createAsyncThunk } from "@reduxjs/toolkit"
import { visits } from "@/modules/rm/api/services/visits"

export const createRmVisit = createAsyncThunk(
  "rmVisits/create",
  async (formData, { rejectWithValue }) => {

    try {

      const data = await visits.addVisits(formData)

      return data

    } catch (err) {

      return rejectWithValue(err.message)

    }

  }
)