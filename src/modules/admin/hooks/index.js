/**
 * Admin module hooks.
 * Re-export store hooks for convenience; feature hooks are admin-specific.
 */
export { useAppDispatch, useAppSelector } from "@/store"
export { useAuth } from "./useAuth"
export { useHasPermission, useHasAnyPermission } from "./useHasPermission"
export { useRMs } from "./useRMs"
export { usePartners } from "./usePartners"
export { usePurchases } from "./usePurchases"
export { useStaff, useStaffById } from "./useStaff"
