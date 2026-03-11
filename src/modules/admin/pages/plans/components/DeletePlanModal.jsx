import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { plansService } from "@/modules/admin/api/services/plansService"
import { handleApiError } from "@/lib/utils/errorHandler"

const DELETE_BLOCKED_MESSAGE = "linked to one or more investments"

const DeletePlanModal = ({
  plan,
  open,
  onClose,
  onDeleted,
  onDeactivateInstead,
}) => {
  const [loading, setLoading] = useState(false)
  const [blockedMessage, setBlockedMessage] = useState(null)

  const handleConfirm = async () => {
    if (!plan?.id) return
    setLoading(true)
    setBlockedMessage(null)
    try {
      await plansService.deletePlan(plan.id)
      onDeleted()
      onClose()
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        ""
      if (
        msg.toLowerCase().includes("linked") ||
        msg.toLowerCase().includes("investment")
      ) {
        setBlockedMessage(msg)
      } else {
        handleApiError(err, "Failed to delete plan")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateInstead = () => {
    if (onDeactivateInstead && plan) {
      onDeactivateInstead(plan)
    }
    onClose()
    setBlockedMessage(null)
  }

  const showDeactivateOption =
    blockedMessage &&
    (blockedMessage.toLowerCase().includes(DELETE_BLOCKED_MESSAGE) ||
      blockedMessage.toLowerCase().includes("linked"))

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete plan</DialogTitle>
          <DialogDescription>
            {plan ? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">{plan.name}</span>?
                This cannot be undone.
              </>
            ) : (
              "Select a plan to delete."
            )}
          </DialogDescription>
        </DialogHeader>

        {showDeactivateOption && (
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Cannot delete this plan</p>
            <p className="mt-1 text-muted-foreground">{blockedMessage}</p>
            <p className="mt-2">
              Deactivate the plan instead to hide it from investors.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {showDeactivateOption ? (
            <Button onClick={handleDeactivateInstead}>
              Deactivate instead
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading || !plan}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeletePlanModal
