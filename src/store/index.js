// Redux Store Configuration
// Production-ready setup with middleware and DevTools

import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"
import rootReducer from "./rootReducer"
import { errorMiddleware } from "./middleware/errorMiddleware"

// Configure the Redux store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Customize serializable check for specific cases
      serializableCheck: {
        // Ignore these action types (useful for file uploads, etc.)
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        // Ignore these paths in the state
        ignoredPaths: ["financial.payouts.uploadProgress"],
      },
      // Enable immutability checks in development
      immutableCheck: import.meta.env.DEV,
    }).concat(errorMiddleware),
  // Enable Redux DevTools only in development
  devTools: import.meta.env.DEV,
})

// Custom typed hooks for better DX
// These provide proper typing and reduce boilerplate in components

/**
 * Custom dispatch hook
 * Use this instead of plain `useDispatch` for proper typing
 */
export const useAppDispatch = () => useDispatch()

/**
 * Custom selector hook
 * Use this instead of plain `useSelector` for proper typing
 */
export const useAppSelector = useSelector

// Export store type for TypeScript (future-proofing)
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

export default store
