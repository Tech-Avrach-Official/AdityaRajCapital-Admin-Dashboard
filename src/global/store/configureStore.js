import { configureStore } from "@reduxjs/toolkit"
import rootReducer from "./rootReducer"
import { errorMiddleware } from "./middleware/errorMiddleware"

export function createStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
          ignoredPaths: ["admin.financial.payouts.uploadProgress"],
        },
        immutableCheck: import.meta.env.DEV,
      }).concat(errorMiddleware),
    devTools: import.meta.env.DEV,
  })
}
