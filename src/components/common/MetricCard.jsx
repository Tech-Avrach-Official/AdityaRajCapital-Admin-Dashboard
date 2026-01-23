import React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  iconColor = "blue",
  className,
}) => {
  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    teal: "bg-teal-100 text-teal-600",
  }

  const isPositive = trend >= 0

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm p-6 border border-border",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div
              className={cn(
                "p-3 rounded-lg",
                iconColorClasses[iconColor] || iconColorClasses.blue
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      {trend !== undefined && trendLabel && (
        <div className="mt-4 flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {Math.abs(trend)}% {trendLabel}
          </span>
        </div>
      )}
    </div>
  )
}

export default MetricCard
