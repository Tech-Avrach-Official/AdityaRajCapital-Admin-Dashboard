import React, { useState, useEffect } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

/**
 * Format currency in INR
 */
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const MAX_REASON_LENGTH = 500

/**
 * RejectPaymentModal - Modal for rejecting a payment with optional reason
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.purchase - Purchase object
 * @param {Function} props.onReject - Callback with { reason } on rejection
 * @param {boolean} props.isLoading - Loading state for submit button
 */
const RejectPaymentModal = ({ isOpen, onClose, purchase, onReject, isLoading = false }) => {
  const [reason, setReason] = useState("")

  // Reset reason when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason("")
    }
  }, [isOpen])

  if (!purchase) return null

  const { id, plan_name, amount, investor_name, investor_id } = purchase

  const handleSubmit = (e) => {
    e.preventDefault()
    onReject({ reason: reason.trim() })
  }

  const handleClose = () => {
    if (!isLoading) {
      setReason("")
      onClose()
    }
  }

  const remainingChars = MAX_REASON_LENGTH - reason.length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Reject Payment
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this payment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Purchase Summary */}
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purchase ID:</span>
                <span className="font-mono font-medium">{id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investor:</span>
                <span className="font-medium">{investor_name || investor_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-green-600">{formatINR(amount)}</span>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="reason">
              Rejection Reason
              <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
            </Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LENGTH))}
              placeholder="Enter reason for rejecting this payment..."
              className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This reason may be shared with the investor</span>
              <span className={remainingChars < 50 ? "text-orange-500" : ""}>
                {remainingChars} characters remaining
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RejectPaymentModal
