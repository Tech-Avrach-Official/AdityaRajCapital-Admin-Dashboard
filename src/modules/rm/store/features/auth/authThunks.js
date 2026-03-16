import { createAsyncThunk } from "@reduxjs/toolkit"
import { authService } from "@/modules/rm/api/services/authService"

export const rmLogin = createAsyncThunk(
  "rmAuth/login",
  async (credentials, { rejectWithValue }) => {

    try {

      const data = await authService.login(credentials)

      return data

    } catch (error) {

      return rejectWithValue(error.message)

    }

  }
)