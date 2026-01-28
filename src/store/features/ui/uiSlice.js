// UI Slice - Global UI state management
// Handles sidebar, modals, notifications, and other UI state

import { createSlice } from "@reduxjs/toolkit"

/**
 * Initial UI state
 */
const initialState = {
  // Sidebar state
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  // Modal state
  activeModal: null, // Modal identifier string
  modalData: null,   // Data to pass to the modal
  
  // Global notifications/alerts
  notifications: [],
  
  // Global loading overlay
  globalLoading: false,
  globalLoadingMessage: "",
  
  // Theme preference (for future dark mode)
  theme: "light",
}

/**
 * UI Slice
 */
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modal, data = null } = action.payload
      state.activeModal = modal
      state.modalData = data
    },
    closeModal: (state) => {
      state.activeModal = null
      state.modalData = null
    },
    setModalData: (state, action) => {
      state.modalData = action.payload
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      )
    },
    clearAllNotifications: (state) => {
      state.notifications = []
    },
    
    // Global loading actions
    setGlobalLoading: (state, action) => {
      if (typeof action.payload === "boolean") {
        state.globalLoading = action.payload
        state.globalLoadingMessage = ""
      } else {
        state.globalLoading = action.payload.loading
        state.globalLoadingMessage = action.payload.message || ""
      }
    },
    
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"
    },
    
    // Reset UI state
    resetUI: () => initialState,
  },
})

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,
  openModal,
  closeModal,
  setModalData,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setGlobalLoading,
  setTheme,
  toggleTheme,
  resetUI,
} = uiSlice.actions

// Export reducer
export default uiSlice.reducer

// ============ Selectors ============

export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed
export const selectActiveModal = (state) => state.ui.activeModal
export const selectModalData = (state) => state.ui.modalData
export const selectNotifications = (state) => state.ui.notifications
export const selectGlobalLoading = (state) => state.ui.globalLoading
export const selectGlobalLoadingMessage = (state) => state.ui.globalLoadingMessage
export const selectTheme = (state) => state.ui.theme
