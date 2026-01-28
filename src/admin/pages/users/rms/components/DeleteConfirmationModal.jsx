import React, { useState } from "react"
import { AlertTriangle, XCircle, Loader2 } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"
import { handleApiError } from "@/lib/utils/errorHandler"

const DeleteConfirmationModal = ({
  open,
  onOpenChange,
  entity,
  entityName = "RM",
  onSuccess,
}) => {
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Get partner count
  const partnerCount = entity?.partner_count ?? entity?.partnersCount ?? 0
  const hasPartners = partnerCount > 0

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setConfirmed(false)
      onOpenChange(false)
    }
  }

  // Handle delete confirmation
  const handleConfirm = async () => {
    if (!confirmed || !entity?.id) return

    setLoading(true)

    try {
      const response = await apiClient.delete(endpoints.rm.delete(entity.id))

      if (response.data?.success) {
        toast.success(`${entityName} deleted successfully`)
        setConfirmed(false)
        onOpenChange(false)
        if (onSuccess) {
          onSuccess(entity)
        }
      } else {
        toast.error(response.data?.message || `Failed to delete ${entityName}`)
      }
    } catch (error) {
      handleApiError(error, `Failed to delete ${entityName}`)
    } finally {
      setLoading(false)
    }
  }

  if (!entity) return null

  // If RM has partners, show error state
  if (hasPartners) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-full">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-destructive">
                  Cannot Delete {entityName}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-sm text-foreground">
                This RM has{" "}
                <strong className="text-destructive">{partnerCount}</strong> linked
                partner(s).
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please reassign all partners to another RM before deleting this RM.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Normal delete confirmation
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Delete {entityName}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-2">
            Are you sure you want to delete{" "}
            <strong>{entity?.name || entityName}</strong>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked)}
              disabled={loading}
            />
            <Label
              htmlFor="confirm"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand this action cannot be undone
            </Label>
          </div>
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!confirmed || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmationModal
