import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig = {
  active: { variant: "success", label: "Active" },
  inactive: { variant: "secondary", label: "Inactive" },
  pending: { variant: "warning", label: "Pending" },
  verified: { variant: "success", label: "Verified" },
  rejected: { variant: "destructive", label: "Rejected" },
  completed: { variant: "default", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  processed: { variant: "success", label: "Processed" },
  failed: { variant: "destructive", label: "Failed" },
  paid: { variant: "success", label: "Paid" },
}

const StatusBadge = ({ status, className, customLabel }) => {
  const config = statusConfig[status?.toLowerCase()] || {
    variant: "secondary",
    label: status || "Unknown",
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(className)}
    >
      {customLabel || config.label}
    </Badge>
  )
}

export default StatusBadge
