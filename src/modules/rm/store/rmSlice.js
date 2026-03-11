import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  sidebarOpen: true,
}

const rmSlice = createSlice({
  name: "rm",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const { toggleSidebar } = rmSlice.actions
export default rmSlice.reducer
