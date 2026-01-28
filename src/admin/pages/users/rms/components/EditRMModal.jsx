import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"
import { handleApiError } from "@/lib/utils/errorHandler"

// Validation schema for RM edit
const rmEditSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  status: z.enum(["active", "inactive"]),
})

const EditRMModal = ({ open, onOpenChange, rm, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(rmEditSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      status: "active",
    },
  })

  const status = watch("status")

  // Reset form when rm changes
  useEffect(() => {
    if (rm && open) {
      reset({
        name: rm.name || "",
        email: rm.email || "",
        phone_number: rm.phone_number || rm.mobile || "",
        status: rm.status || "active",
      })
    }
  }, [rm, open, reset])

  // Get RM code
  const rmCode = rm?.rm_code || rm?.referralCode || "-"

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  // Handle form submission
  const handleFormSubmit = async (data) => {
    if (!rm?.id) return

    setLoading(true)

    try {
      const response = await apiClient.put(endpoints.rm.update(rm.id), {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone_number: data.phone_number.trim(),
        status: data.status,
      })

      if (response.data?.success) {
        toast.success("RM updated successfully")
        onOpenChange(false)
        if (onSuccess) {
          onSuccess(response.data.data)
        }
      } else {
        toast.error(response.data?.message || "Failed to update RM")
      }
    } catch (error) {
      handleApiError(error, "Failed to update RM")
    } finally {
      setLoading(false)
    }
  }

  if (!rm) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Relationship Manager</DialogTitle>
          <DialogDescription>
            Update RM account information. RM Code cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* RM Code - Read Only */}
          <div className="space-y-2">
            <Label>RM Code</Label>
            <div className="px-3 py-2 bg-muted rounded-md border">
              <span className="font-mono text-sm text-muted-foreground">{rmCode}</span>
            </div>
            <p className="text-xs text-muted-foreground">RM Code cannot be changed</p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter full name"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Phone and Email - Two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                {...register("phone_number")}
                placeholder="10 digit number"
                maxLength={10}
                disabled={loading}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={status}
              onValueChange={(value) => setValue("status", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditRMModal
