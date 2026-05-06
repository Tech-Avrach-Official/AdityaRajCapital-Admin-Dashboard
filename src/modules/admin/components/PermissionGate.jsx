// PermissionGate — wraps children behind a permission check. Renders `fallback`
// (default: nothing) when the current user lacks the required permission.
// Super_admin always passes (handled in useHasPermission).

import { useHasPermission, useHasAnyPermission } from "@/modules/admin/hooks"

const PermissionGate = ({ require, requireAny, fallback = null, children }) => {
  const allowedSingle = useHasPermission(require || "")
  const allowedAny = useHasAnyPermission(requireAny || [])

  const allowed = require ? allowedSingle : requireAny ? allowedAny : true

  return allowed ? children : fallback
}

export default PermissionGate
