// StaffProfileForm — name/email/mobile fields shared between StaffDetailPage
// (admin editing someone else) and MyProfilePage (self-edit). Backed by
// PUT /:id which only accepts these three fields.

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Enter a valid email"),
  mobile: z
    .string()
    .regex(/^[0-9+\-\s]{6,20}$/, "Enter a valid mobile (6–20 digits)")
    .optional()
    .or(z.literal("")),
})

const StaffProfileForm = ({ initial, onSubmit, submitting, disabled }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initial?.name || "",
      email: initial?.email || "",
      mobile: initial?.mobile || "",
    },
  })

  useEffect(() => {
    reset({
      name: initial?.name || "",
      email: initial?.email || "",
      mobile: initial?.mobile || "",
    })
  }, [initial, reset])

  const handleFormSubmit = handleSubmit((values) => {
    const body = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
    }
    if (values.mobile?.trim()) body.mobile = values.mobile.trim()
    return onSubmit(body)
  })

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register("name")}
            disabled={disabled || submitting}
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
            disabled={disabled || submitting}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="mobile">Mobile (optional)</Label>
          <Input
            id="mobile"
            {...register("mobile")}
            disabled={disabled || submitting}
            className={errors.mobile ? "border-destructive" : ""}
          />
          {errors.mobile && (
            <p className="text-xs text-destructive">{errors.mobile.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || submitting || !isDirty}>
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save profile
        </Button>
      </div>
    </form>
  )
}

export default StaffProfileForm
