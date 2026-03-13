import { createSlice } from "@reduxjs/toolkit"
import { fetchInvestorInvestments } from "./investorThunk"

const initialState = {
  investors: [],
  investorInvestments: null,
  loading: false,
  error: null,
}

const investorSlice = createSlice({
  name: "investors",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(fetchInvestorInvestments.pending, (state) => {
        state.loading = true
      })

      .addCase(fetchInvestorInvestments.fulfilled, (state, action) => {
        state.loading = false
        state.investorInvestments = action.payload
      })

      .addCase(fetchInvestorInvestments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

  }
})

export default investorSlice.reducer