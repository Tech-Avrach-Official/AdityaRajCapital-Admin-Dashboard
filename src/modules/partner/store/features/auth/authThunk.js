import { createAsyncThunk } from "@reduxjs/toolkit"
import { authService } from "@/modules/partner/api/services/authService"

export const partnerLogin = createAsyncThunk(
  "partnerAuth/login",
  async (credentials, { rejectWithValue }) => {

    try {

      const data = await authService.login(credentials)

      return data

    } catch (error) {

      return rejectWithValue(error.message)

    }

  }
)