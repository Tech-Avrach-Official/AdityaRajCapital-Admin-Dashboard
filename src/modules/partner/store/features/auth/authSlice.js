import { createSlice } from "@reduxjs/toolkit"
import { partnerLogin } from "./authThunk"

const initialState = {

  token: localStorage.getItem("partnerToken") || null,

  partner: JSON.parse(localStorage.getItem("partnerData")) || null,

  rm: JSON.parse(localStorage.getItem("rmData")) || null,

  loading: false,
  error: null,

}

const authSlice = createSlice({

  name: "partnerAuth",

  initialState,

  reducers: {

    logout(state) {

      state.token = null
      state.partner = null
      state.rm = null

      localStorage.removeItem("partnerToken")
localStorage.removeItem("partnerId")
localStorage.removeItem("partnerData")
localStorage.removeItem("rmData")

    }

  },

  extraReducers: (builder) => {

    builder

      .addCase(partnerLogin.pending, (state) => {

        state.loading = true
        state.error = null

      })

      .addCase(partnerLogin.fulfilled, (state, action) => {

        state.loading = false

        const { token, partner, rm } = action.payload

        state.token = token
        state.partner = partner
        state.rm = rm

        localStorage.setItem("partnerToken", token)
        localStorage.setItem("partnerData", JSON.stringify(partner))
localStorage.setItem("rmData", JSON.stringify(rm))

        if (partner?.id) {
          localStorage.setItem("partnerId", String(partner.id))
        }

        console.log("Login successful, partner data:", partner)
        console.log("RM data:", rm)

      })

      .addCase(partnerLogin.rejected, (state, action) => {

        state.loading = false
        state.error = action.payload

      })

  }

})

export const { logout } = authSlice.actions

export default authSlice.reducer