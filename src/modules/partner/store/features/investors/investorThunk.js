import { createAsyncThunk } from "@reduxjs/toolkit"
import { investorService } from "@/modules/partner/api/services/investorService"

export const fetchInvestorInvestments = createAsyncThunk(
  "investors/fetchInvestorInvestments",
  async (investorId, { rejectWithValue }) => {

    try {

      const data = await investorService.getInvestorInvestments(investorId)

      return data

    } catch (error) {

      return rejectWithValue(
        error.message || "Failed to fetch investments"
      )

    }

  }
)