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
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/20",
  }

  const isPositive = trend >= 0

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-border/50",
        "flex flex-col h-full",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-2 truncate">
            {title}
          </p>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-foreground leading-tight break-words">
              {value}
            </h3>
            {subtitle && (
              <p className="text-xs font-medium text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {Icon && (
          <div
            className={cn(
              "p-3 rounded-xl shrink-0",
              iconColorClasses[iconColor] || iconColorClasses.blue
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {trend !== undefined && trendLabel && (
        <div className="mt-auto flex items-center gap-1.5 pt-3 border-t border-border/50">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success shrink-0" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive shrink-0" />
          )}
          <span
            className={cn(
              "text-xs font-semibold",
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
