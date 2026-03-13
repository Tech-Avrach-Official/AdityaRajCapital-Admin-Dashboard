import { createSlice } from "@reduxjs/toolkit"
import { fetchKycDocuments } from "./profileThunk"

const initialState = {

  documents: [],
  loading: false,
  error: null,

}

const profileSlice = createSlice({

  name: "partnerProfile",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(fetchKycDocuments.pending, (state) => {
        state.loading = true
      })

      .addCase(fetchKycDocuments.fulfilled, (state, action) => {

        state.loading = false
        state.documents = action.payload

      })

      .addCase(fetchKycDocuments.rejected, (state, action) => {

        state.loading = false
        state.error = action.payload

      })

  }

})

export default profileSlice.reducer