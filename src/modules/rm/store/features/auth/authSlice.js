import { createSlice } from "@reduxjs/toolkit"
import { rmLogin } from "./authThunks"

const initialState = {

  token: localStorage.getItem("rmToken") || null,

  rm: JSON.parse(localStorage.getItem("rmData")) || null,

  loading: false,
  error: null,

}

const authSlice = createSlice({

  name: "rmAuth",

  initialState,

  reducers: {

    logout(state) {

      state.token = null
      state.rm = null

      localStorage.removeItem("rmToken")
      localStorage.removeItem("rmId")
      localStorage.removeItem("rmData")

    }

  },

  extraReducers: (builder) => {

    builder

      .addCase(rmLogin.pending, (state) => {

        state.loading = true
        state.error = null

      })

      .addCase(rmLogin.fulfilled, (state, action) => {

        state.loading = false

        const { token,  rm } = action.payload

        state.token = token
        
        state.rm = rm

        localStorage.setItem("rmToken", token)

localStorage.setItem("rmData", JSON.stringify(rm))

      
        console.log("RM data:", rm)

      })

      .addCase(rmLogin.rejected, (state, action) => {

        state.loading = false
        state.error = action.payload

      })

  }

})

export const { logout } = authSlice.actions

export default authSlice.reducer