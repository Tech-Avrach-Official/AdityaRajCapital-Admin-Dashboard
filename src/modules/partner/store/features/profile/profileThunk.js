import { createAsyncThunk } from "@reduxjs/toolkit"
import { profileService } from "@/modules/partner/api/services/profileService"

export const fetchKycDocuments = createAsyncThunk(
  "partnerProfile/fetchKycDocuments",

  async (_, { rejectWithValue }) => {

    try {

      const data = await profileService.getKycDocuments()

      return data

    } catch (error) {

      return rejectWithValue(error.message)

    }

  }
)