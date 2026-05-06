// useHasPermission — React hook that reads role + permissions from Redux
// and short-circuits for super_admin. Use this inside components.
// For thunks/middleware/non-React code, use the pure hasPermission() from
// @/modules/admin/lib/permissions.

import { useAppSelector } from "@/store"
import {
  selectRole,
  selectPermissions,
} from "@/modules/admin/store/features/auth/authSelectors"
import { hasPermission } from "@/modules/admin/lib/permissions"

export function useHasPermission(required) {
  const role = useAppSelector(selectRole)
  const permissions = useAppSelector(selectPermissions)
  if (role === "super_admin") return true
  return hasPermission(permissions, required)
}

export function useHasAnyPermission(requiredList) {
  const role = useAppSelector(selectRole)
  const permissions = useAppSelector(selectPermissions)
  if (role === "super_admin") return true
  if (!Array.isArray(requiredList) || requiredList.length === 0) return true
  return requiredList.some((r) => hasPermission(permissions, r))
}

export default useHasPermission
