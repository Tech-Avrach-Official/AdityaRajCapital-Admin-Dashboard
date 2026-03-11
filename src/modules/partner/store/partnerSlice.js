import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  sidebarOpen: true,
}

const partnerSlice = createSlice({
  name: "partner",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const { toggleSidebar } = partnerSlice.actions
export default partnerSlice.reducer
