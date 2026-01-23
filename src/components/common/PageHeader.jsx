import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const PageHeader = ({
  title,
  description,
  action,
  actionLabel,
  onActionClick,
  className,
}) => {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={onActionClick} size="default">
            {actionLabel || action}
          </Button>
        )}
      </div>
    </div>
  )
}

export default PageHeader
