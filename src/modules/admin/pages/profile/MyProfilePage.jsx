// MyProfilePage — self-service profile editor.
// Uses PUT /api/admin/staff/<role-plural>/<id> via staffService.updateProfile.
// Hides scope/permissions/status/reset-password/delete sections (backend would
// reject self-edits with VAL_002 anyway). Super_admin doesn't map to a
// role-plural under /api/admin/staff, so we render a read-only profile.

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/modules/admin/hooks"
import {
  ROLE_TO_PLURAL,
  staffService,
} from "@/modules/admin/api/services/staffService"
import { useAppDispatch } from "@/store"
import { setStaffProfile } from "@/modules/admin/store/features/auth/authSlice"
import StaffProfileForm from "@/modules/admin/components/staff/StaffProfileForm"
import {
  PERMISSION_CATALOG,
  MODULE_LABELS,
  hasPermission,
} from "@/modules/admin/lib/permissions"

const ROLE_LABEL = {
  super_admin: "Super Admin",
  admin: "Admin",
  nation_head: "Nation Head",
  state_head: "State Head",
  branch_head: "Branch Head",
}

const MyProfilePage = () => {
  const dispatch = useAppDispatch()
  const { staff, role, permissions, scope, isSuperAdmin } = useAuth()
  const rolePlural = ROLE_TO_PLURAL[role]

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [record, setRecord] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!rolePlural || !staff?.id) return
      setLoading(true)
      try {
        const data = await staffService.get(rolePlural, staff.id)
        if (!cancelled) setRecord(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [rolePlural, staff?.id])

  const handleSubmit = async (body) => {
    if (!rolePlural || !staff?.id) return
    setSaving(true)
    try {
      const updated = await staffService.updateProfile(rolePlural, staff.id, body)
      setRecord(updated)
      // Refresh in-memory header name/email.
      dispatch(
        setStaffProfile({
          name: updated.name,
          email: updated.email,
        })
      )
      toast.success("Profile updated")
    } catch (e) {
      const msg =
        e?.data?.message || e?.message || "Failed to update profile"
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const groupedPerms = useMemo(() => {
    const out = []
    for (const [moduleKey, leaves] of Object.entries(PERMISSION_CATALOG)) {
      const held = isSuperAdmin
        ? leaves
        : leaves.filter((l) => hasPermission(permissions, l))
      if (held.length) out.push({ moduleKey, leaves: held })
    }
    return out
  }, [isSuperAdmin, permissions])

  const profileSource = record || staff

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your contact details and review the access you currently hold."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>
            You can update your own name, email, and mobile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !record ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : isSuperAdmin && !record ? (
            <div className="text-sm text-muted-foreground">
              Super Admin profile is read-only here.
              <div className="mt-3 grid sm:grid-cols-2 gap-y-2 gap-x-4 text-foreground">
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div>{profileSource?.name || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div>{profileSource?.email || "—"}</div>
                </div>
              </div>
            </div>
          ) : (
            <StaffProfileForm
              initial={profileSource}
              onSubmit={handleSubmit}
              submitting={saving}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role &amp; scope</CardTitle>
          <CardDescription>
            Read-only. Ask an administrator if you need different access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{ROLE_LABEL[role] || role || "—"}</Badge>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Nations</div>
              <div>{scope?.nations?.length ? scope.nations.join(", ") : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">States</div>
              <div>{scope?.states?.length ? scope.states.join(", ") : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Branches</div>
              <div>
                {scope?.branches?.length ? scope.branches.join(", ") : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permissions</CardTitle>
          <CardDescription>
            {isSuperAdmin
              ? "You hold all permissions (super admin)."
              : "These are the actions you can perform."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupedPerms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No permissions assigned. Ask an administrator to grant access.
            </p>
          ) : (
            <div className="space-y-3">
              {groupedPerms.map(({ moduleKey, leaves }) => (
                <div key={moduleKey}>
                  <div className="text-sm font-medium mb-1">
                    {MODULE_LABELS[moduleKey] || moduleKey}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {leaves.map((leaf) => (
                      <Badge
                        key={leaf}
                        variant="outline"
                        className="font-mono text-[11px]"
                      >
                        {leaf.replace(`${moduleKey}.`, "")}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MyProfilePage
