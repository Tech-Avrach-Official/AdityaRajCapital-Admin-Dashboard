// RoutePermissionGuard — wraps a route element behind a permission check.
// Renders NotAuthorizedPage when the current user lacks the required permission.
// Use only at the route level — for inline button/action gating use PermissionGate.

import { useHasPermission, useHasAnyPermission } from "@/modules/admin/hooks"
import NotAuthorizedPage from "@/modules/admin/pages/errors/NotAuthorizedPage"

const RoutePermissionGuard = ({ require, requireAny, children }) => {
  const allowedSingle = useHasPermission(require || "")
  const allowedAny = useHasAnyPermission(requireAny || [])
  const allowed = require ? allowedSingle : requireAny ? allowedAny : true
  if (!allowed) return <NotAuthorizedPage />
  return children
}

export default RoutePermissionGuard
