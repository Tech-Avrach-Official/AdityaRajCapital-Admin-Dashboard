import React, { useState, useEffect } from "react"
import { CheckCircle, Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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

const MAX_CHEQUE_NUMBER_LENGTH = 50

/**
 * ApprovePaymentModal - Modal for approving (verifying) a payment with required cheque number
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.purchase - Purchase object
 * @param {Function} props.onApprove - Callback with { cheque_number } on approve
 * @param {boolean} props.isLoading - Loading state for submit button
 * @param {string} props.chequeError - Error message for cheque number field (e.g. VAL_001)
 */
const ApprovePaymentModal = ({
  isOpen,
  onClose,
  purchase,
  onApprove,
  isLoading = false,
  chequeError = null,
}) => {
  const [chequeNumber, setChequeNumber] = useState("")

  // Reset when modal opens/closes; clear error when user types
  useEffect(() => {
    if (!isOpen) {
      setChequeNumber("")
    }
  }, [isOpen])

  if (!purchase) return null

  const { id, plan_name, amount, investor_name, investor_id } = purchase
  const hasChequeError = Boolean(chequeError)
  const trimmedCheque = chequeNumber.trim()
  const canSubmit = trimmedCheque.length > 0 && !isLoading

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onApprove({ cheque_number: trimmedCheque })
  }

  const handleClose = () => {
    if (!isLoading) {
      setChequeNumber("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Approve Payment
          </DialogTitle>
          <DialogDescription>
            Enter the cheque number to verify this payment. It will be stored on the Promissory Note.
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

          {/* Cheque Number (required) */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="cheque_number">
              Cheque Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cheque_number"
              type="text"
              value={chequeNumber}
              onChange={(e) => setChequeNumber(e.target.value.slice(0, MAX_CHEQUE_NUMBER_LENGTH))}
              placeholder="Enter cheque number"
              maxLength={MAX_CHEQUE_NUMBER_LENGTH}
              disabled={isLoading}
              className={cn(
                "w-full",
                hasChequeError && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={hasChequeError}
              aria-describedby={hasChequeError ? "cheque_error" : undefined}
            />
            {hasChequeError && (
              <p id="cheque_error" className="text-sm text-destructive">
                {chequeError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Max {MAX_CHEQUE_NUMBER_LENGTH} characters
            </p>
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
              className="bg-green-600 hover:bg-green-700"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ApprovePaymentModal
