import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import PageHeader from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  STAFF_ROLE_PLURALS,
  PLURAL_LABELS,
  PLURAL_TO_ROLE,
  ROLE_SCOPE_KEY,
} from "@/modules/admin/api/services/staffService"
import {
  useStaff,
  useStaffById,
  useAuth,
  useHasPermission,
} from "@/modules/admin/hooks"
import NotAuthorizedPage from "@/modules/admin/pages/errors/NotAuthorizedPage"
import StaffProfileForm from "@/modules/admin/components/staff/StaffProfileForm"
import ScopePicker from "@/modules/admin/components/staff/ScopePicker"
import PermissionPicker from "@/modules/admin/components/staff/PermissionPicker"
import EffectiveAtNextLoginNote from "@/modules/admin/components/staff/EffectiveAtNextLoginNote"
import ConfirmDialog from "@/modules/admin/components/staff/ConfirmDialog"

const passwordPattern = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{7,}$/

const StaffDetailPage = () => {
  const { rolePlural, id } = useParams()
  const navigate = useNavigate()
  const numericId = Number(id)
  const isValid =
    STAFF_ROLE_PLURALS.includes(rolePlural) && Number.isInteger(numericId)

  const targetRole = PLURAL_TO_ROLE[rolePlural]
  const scopeKey = ROLE_SCOPE_KEY[targetRole]
  const permKey = (action) => `staff.${targetRole?.replace("_", "-")}.${action}`

  const canUpdate = useHasPermission(permKey("update"))
  const canAssignScope = useHasPermission(permKey("assign-scope"))
  const canAssignPermissions = useHasPermission(permKey("assign-permissions"))
  const canResetPassword = useHasPermission(permKey("reset-password"))
  const canDelete = useHasPermission(permKey("delete"))

  const { staffId: currentStaffId } = useAuth()
  const isSelf = currentStaffId === numericId

  const {
    fetchOne,
    updateProfile,
    replaceScope,
    replacePermissions,
    setStatus,
    resetPassword,
    remove,
    isProcessing,
    updating,
  } = useStaff(rolePlural)
  const staff = useStaffById(rolePlural, numericId)

  // Local edit buffers (so user can stage changes before saving each section).
  const [scopeBuf, setScopeBuf] = useState(null)
  const [permBuf, setPermBuf] = useState(null)
  const [statusBuf, setStatusBuf] = useState(null)
  const [savedSections, setSavedSections] = useState({})

  // Reset password modal state.
  const [resetOpen, setResetOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordError, setNewPasswordError] = useState("")

  // Delete modal state.
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (isValid) fetchOne(numericId)
  }, [fetchOne, isValid, numericId])

  useEffect(() => {
    if (staff) {
      setScopeBuf(staff.scope?.[scopeKey] || [])
      setPermBuf(staff.permissions || [])
      setStatusBuf(staff.status || "active")
    }
  }, [staff, scopeKey])

  const isLoading = !staff && isValid
  const processing = isProcessing(numericId)

  const markSaved = (section) =>
    setSavedSections((prev) => ({ ...prev, [section]: true }))

  if (!isValid) return <NotAuthorizedPage title="Unknown staff record" />

  const handleProfileSubmit = async (body) => {
    const result = await updateProfile(numericId, body)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Profile updated")
    }
  }

  const handleScopeSave = async () => {
    const result = await replaceScope(numericId, { [scopeKey]: scopeBuf })
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Scope updated")
      markSaved("scope")
    }
  }

  const handlePermissionsSave = async () => {
    const result = await replacePermissions(numericId, permBuf)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Permissions updated")
      markSaved("permissions")
    }
  }

  const handleStatusSave = async () => {
    const result = await setStatus(numericId, statusBuf)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Status updated")
      markSaved("status")
    }
  }

  const handleResetPassword = async () => {
    if (!passwordPattern.test(newPassword)) {
      setNewPasswordError("Min 7 chars, ≥1 digit, ≥1 symbol")
      return
    }
    setNewPasswordError("")
    const result = await resetPassword(numericId, newPassword)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Password reset. Communicate it to the user out-of-band.")
      setResetOpen(false)
      setNewPassword("")
    }
  }

  const handleDelete = async () => {
    const result = await remove(numericId)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Staff deleted")
      navigate(`/admin/staff/${rolePlural}`)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/admin/staff/${rolePlural}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {PLURAL_LABELS[rolePlural]}
      </Link>

      <PageHeader
        title={staff?.name || "Loading…"}
        description={staff?.email}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !staff ? (
        <NotAuthorizedPage
          title="Not found"
          message="This record doesn't exist or is outside your scope."
        />
      ) : (
        <>
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>
                Editable by anyone with permission, including the user themselves.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffProfileForm
                initial={staff}
                onSubmit={handleProfileSubmit}
                submitting={updating}
                disabled={!canUpdate && !isSelf}
              />
            </CardContent>
          </Card>

          {/* Below sections are hidden for self-edit (backend would 400 anyway). */}
          {!isSelf && (
            <>
              {canAssignScope && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Scope</CardTitle>
                    <CardDescription>
                      Replaces the entire scope set wholesale.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scopeBuf !== null && (
                      <ScopePicker
                        targetRole={targetRole}
                        value={scopeBuf}
                        onChange={setScopeBuf}
                        disabled={processing}
                      />
                    )}
                    <div className="flex justify-end">
                      <Button onClick={handleScopeSave} disabled={processing}>
                        {processing && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Save scope
                      </Button>
                    </div>
                    {savedSections.scope && <EffectiveAtNextLoginNote />}
                  </CardContent>
                </Card>
              )}

              {canAssignPermissions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Permissions</CardTitle>
                    <CardDescription>
                      Replaces the full permissions list wholesale. Leave empty
                      to revoke all (user can log in but has no actions).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {permBuf !== null && (
                      <PermissionPicker
                        value={permBuf}
                        onChange={setPermBuf}
                        disabled={processing}
                      />
                    )}
                    <div className="flex justify-end">
                      <Button onClick={handlePermissionsSave} disabled={processing}>
                        {processing && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Save permissions
                      </Button>
                    </div>
                    {savedSections.permissions && <EffectiveAtNextLoginNote />}
                  </CardContent>
                </Card>
              )}

              {canUpdate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Status</CardTitle>
                    <CardDescription>
                      Inactive staff are blocked from logging in immediately.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={statusBuf === "active"}
                        onCheckedChange={(checked) =>
                          setStatusBuf(checked ? "active" : "inactive")
                        }
                        disabled={processing}
                      />
                      <span className="text-sm">
                        {statusBuf === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleStatusSave} disabled={processing}>
                        {processing && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Save status
                      </Button>
                    </div>
                    {savedSections.status && <EffectiveAtNextLoginNote />}
                  </CardContent>
                </Card>
              )}

              {canResetPassword && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Reset password</CardTitle>
                    <CardDescription>
                      Sets a new password immediately. Existing sessions remain
                      valid until expiry. Communicate the new password
                      out-of-band.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => setResetOpen(true)}
                      disabled={processing}
                    >
                      Reset password
                    </Button>
                  </CardContent>
                </Card>
              )}

              {canDelete && (
                <Card className="border-destructive/40">
                  <CardHeader>
                    <CardTitle className="text-base text-destructive">
                      Delete staff
                    </CardTitle>
                    <CardDescription>
                      Soft delete: the staff member is set inactive and can no
                      longer log in. The email becomes available for re-creation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                      disabled={processing}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset password"
        description={`Set a new password for ${staff?.name || "this staff member"}. They won't be notified — share the new password out-of-band.`}
        confirmLabel="Reset"
        loading={processing}
        onConfirm={handleResetPassword}
      >
        <div className="space-y-1.5">
          <Label htmlFor="new_password">New password</Label>
          <Input
            id="new_password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={processing}
            className={newPasswordError ? "border-destructive" : ""}
          />
          {newPasswordError ? (
            <p className="text-xs text-destructive">{newPasswordError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Min 7 chars, ≥1 digit, ≥1 symbol.
            </p>
          )}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete staff?"
        description={`This soft-deletes ${staff?.name || "this staff member"}. They will be unable to log in. There's no undelete in v1.`}
        confirmLabel="Delete"
        destructive
        loading={processing}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default StaffDetailPage
