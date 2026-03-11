/**
 * Re-export global store so existing @/store imports keep working.
 * Actual store is created in global/store with merged module reducers.
 */
export { store, useAppDispatch, useAppSelector } from "@/global/store"
export { default } from "@/global/store"
