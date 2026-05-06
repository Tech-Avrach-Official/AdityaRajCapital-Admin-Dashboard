import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import PageHeader from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  STAFF_ROLE_PLURALS,
  PLURAL_LABELS,
  PLURAL_TO_ROLE,
  ROLE_SCOPE_KEY,
} from "@/modules/admin/api/services/staffService"
import { useStaff } from "@/modules/admin/hooks"
import NotAuthorizedPage from "@/modules/admin/pages/errors/NotAuthorizedPage"
import ScopePicker from "@/modules/admin/components/staff/ScopePicker"
import PermissionPicker from "@/modules/admin/components/staff/PermissionPicker"

const passwordPattern = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{7,}$/
const mobilePattern = /^[0-9+\-\s]{6,20}$/

const baseSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Enter a valid email"),
  mobile: z
    .string()
    .regex(mobilePattern, "Enter a valid mobile (6–20 digits)")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .regex(
      passwordPattern,
      "Min 7 chars, with at least 1 digit and 1 symbol"
    ),
  scopeIds: z.array(z.union([z.number(), z.string()])).min(1, "Pick at least one"),
  permissions: z.array(z.string()),
})

const CreateStaffPage = () => {
  const { rolePlural } = useParams()
  const navigate = useNavigate()
  const { create, creating } = useStaff(rolePlural)

  const isValid = STAFF_ROLE_PLURALS.includes(rolePlural)
  const targetRole = PLURAL_TO_ROLE[rolePlural]
  const scopeKey = ROLE_SCOPE_KEY[targetRole]

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      scopeIds: [],
      permissions: [],
    },
  })

  const [submitErrorBanner, setSubmitErrorBanner] = useState("")

  if (!isValid) return <NotAuthorizedPage title="Unknown staff role" />

  const onSubmit = async (values) => {
    setSubmitErrorBanner("")
    const body = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      scope: { [scopeKey]: values.scopeIds },
      permissions: values.permissions,
    }
    if (values.mobile?.trim()) body.mobile = values.mobile.trim()

    const result = await create(body)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success(`${PLURAL_LABELS[rolePlural]} created`)
      navigate(`/admin/staff/${rolePlural}/${result.payload.staff.id}`)
      return
    }
    // Map error_code to a user-friendly inline error.
    const err = result.payload || {}
    const code = err?.data?.error_code
    const message =
      err?.data?.message || err?.message || "Failed to create staff"
    if (code === "DB_007") {
      setError("email", { message: "Email already in use" })
    } else if (code === "VAL_002") {
      setSubmitErrorBanner(message)
    } else {
      setSubmitErrorBanner(message)
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
        title={`Create ${PLURAL_LABELS[rolePlural].slice(0, -1)}`}
        description="Set credentials, scope, and permissions. The new staff member will receive these on their next login."
      />

      {submitErrorBanner && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {submitErrorBanner}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={creating}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                disabled={creating}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile (optional)</Label>
              <Input
                id="mobile"
                {...register("mobile")}
                disabled={creating}
                className={errors.mobile ? "border-destructive" : ""}
              />
              {errors.mobile && (
                <p className="text-xs text-destructive">{errors.mobile.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                disabled={creating}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Min 7 chars, ≥1 digit, ≥1 symbol.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="scopeIds"
              render={({ field }) => (
                <ScopePicker
                  targetRole={targetRole}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={creating}
                />
              )}
            />
            {errors.scopeIds && (
              <p className="text-xs text-destructive mt-2">
                {errors.scopeIds.message}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="permissions"
              render={({ field }) => (
                <PermissionPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={creating}
                />
              )}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Empty permissions are allowed (the user can log in but has no
              actions). You can edit these later.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/staff/${rolePlural}`)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={creating}>
            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateStaffPage
