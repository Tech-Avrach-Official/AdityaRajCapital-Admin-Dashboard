import React, { useState, useEffect } from "react"
import { Loader2, AlertTriangle, UserCog } from "lucide-react"
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

/**
 * ChangeRMModal - Modal to change a partner's assigned RM
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.partner - Partner object to change RM for
 * @param {Function} props.onSuccess - Called after successful change
 */
const ChangeRMModal = ({ isOpen, onClose, partner, onSuccess }) => {
  const [rms, setRms] = useState([])
  const [selectedRM, setSelectedRM] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingRMs, setFetchingRMs] = useState(false)

  // Get current RM info
  const currentRMId = partner?.rm?.rm_id || partner?.rm_id || null
  const currentRMCode = partner?.rm?.rm_code || ""
  const currentRMName = partner?.rm?.rm_name || partner?.rmName || ""

  // Fetch RMs when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRMs()
      setSelectedRM("")
    }
  }, [isOpen])

  const fetchRMs = async () => {
    setFetchingRMs(true)
    try {
      const response = await apiClient.get(endpoints.rm.list)

      if (response.data?.success) {
        // Filter to only show active RMs
        const activeRMs = (response.data.data?.rms || []).filter(
          (rm) => rm.status === "active"
        )
        setRms(activeRMs)
      } else {
        toast.error("Failed to load RMs")
      }
    } catch (error) {
      handleApiError(error, "Failed to load RMs")
    } finally {
      setFetchingRMs(false)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setSelectedRM("")
      onClose()
    }
  }

  // Handle RM change submission
  const handleSubmit = async () => {
    if (!selectedRM) {
      toast.error("Please select an RM")
      return
    }

    if (selectedRM === String(currentRMId)) {
      toast.error("Please select a different RM")
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.patch(
        endpoints.partners.changeRM(partner.id),
        { rm_id: parseInt(selectedRM) }
      )

      if (response.data?.success) {
        const newRMName = response.data.data?.new_rm_name || "New RM"
        toast.success(`Partner assigned to ${newRMName}`)
        handleClose()
        if (onSuccess) {
          onSuccess(response.data.data)
        }
      } else {
        toast.error(response.data?.message || "Failed to change RM")
      }
    } catch (error) {
      handleApiError(error, "Failed to change RM")
    } finally {
      setLoading(false)
    }
  }

  if (!partner) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Change Assigned RM</DialogTitle>
          </div>
          <DialogDescription>
            Reassign this partner to a different Relationship Manager.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Partner Info */}
          <div className="space-y-1">
            <Label className="text-muted-foreground">Partner</Label>
            <p className="font-medium">{partner.name}</p>
          </div>

          {/* Current RM */}
          <div className="space-y-1">
            <Label className="text-muted-foreground">Current RM</Label>
            {currentRMName ? (
              <div>
                <p className="font-medium">{currentRMName}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {currentRMCode}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Unassigned</p>
            )}
          </div>

          {/* Select New RM */}
          <div className="space-y-2">
            <Label htmlFor="newRM">Select New RM *</Label>
            {fetchingRMs ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading RMs...</span>
              </div>
            ) : (
              <Select
                value={selectedRM}
                onValueChange={setSelectedRM}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an RM" />
                </SelectTrigger>
                <SelectContent>
                  {rms.length === 0 ? (
                    <SelectItem value="_no_rms" disabled>
                      No active RMs available
                    </SelectItem>
                  ) : (
                    rms.map((rm) => (
                      <SelectItem key={rm.id} value={String(rm.id)}>
                        <div className="flex items-center gap-2">
                          <span>{rm.name}</span>
                          <span className="text-muted-foreground font-mono text-xs">
                            ({rm.rm_code || rm.referralCode})
                          </span>
                          {rm.id === currentRMId && (
                            <span className="text-xs bg-muted px-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>This will reassign the partner to a different RM.</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedRM || fetchingRMs}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change RM"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ChangeRMModal
