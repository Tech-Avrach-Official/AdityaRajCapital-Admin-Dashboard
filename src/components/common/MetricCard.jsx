import React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  subtext,
  icon: Icon,
  iconColor = "blue",
  variant = "default",
  className,
}) => {
  const iconColorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/20",
  }

  const isActionCard = variant === "action"

  const isPositive = trend >= 0

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md",
        "px-5 py-5 sm:px-6 sm:py-6",
        isActionCard
          ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20"
          : "border-border/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {value}
            </h3>
            {subtitle && (
              <p className="truncate text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
            {subtext && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {subtext}
              </p>
            )}
          </div>
        </div>
        {Icon && (
          <div
            className={cn(
              "shrink-0 rounded-lg p-2.5 sm:p-3",
              isActionCard ? iconColorClasses.amber : iconColorClasses[iconColor] || iconColorClasses.blue
            )}
          >
            <Icon className="h-5 w-5 sm:h-5 sm:w-5" />
          </div>
        )}
      </div>

      {trend !== undefined && trendLabel && (
        <div className="mt-auto flex items-center gap-1.5 border-t border-border/40 pt-4">
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
