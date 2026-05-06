import React, { useMemo, useState } from "react"
import { Check, ChevronDown, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/**
 * MultiSelect — generic multi-select built from existing shadcn primitives.
 *
 * Props:
 *  - options: Array<{ value, label, hint? }>
 *  - value: any[]
 *  - onChange: (next: any[]) => void
 *  - placeholder?: string
 *  - searchable?: boolean (default true)
 *  - className?: string
 *  - disabled?: boolean
 *  - emptyMessage?: string
 */
const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select…",
  searchable = true,
  className,
  disabled = false,
  emptyMessage = "No matches",
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const valueSet = useMemo(() => new Set(value), [value])

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter(
      (o) =>
        String(o.label).toLowerCase().includes(q) ||
        String(o.value).toLowerCase().includes(q) ||
        (o.hint && String(o.hint).toLowerCase().includes(q))
    )
  }, [options, query])

  const toggle = (v) => {
    if (valueSet.has(v)) {
      onChange?.(value.filter((x) => x !== v))
    } else {
      onChange?.([...value, v])
    }
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange?.([])
  }

  const selectedLabels = options
    .filter((o) => valueSet.has(o.value))
    .map((o) => ({ value: o.value, label: o.label }))

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between min-h-10 h-auto py-2 font-normal",
            className
          )}
          type="button"
        >
          <div className="flex flex-wrap items-center gap-1 min-w-0">
            {selectedLabels.length === 0 ? (
              <span className="text-muted-foreground text-sm">
                {placeholder}
              </span>
            ) : (
              selectedLabels.map((sel) => (
                <Badge
                  key={sel.value}
                  variant="secondary"
                  className="gap-1 max-w-[180px]"
                >
                  <span className="truncate">{sel.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(sel.value)
                    }}
                    className="hover:bg-muted-foreground/20 rounded-sm"
                    aria-label={`Remove ${sel.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {selectedLabels.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] p-0 max-h-80 overflow-hidden"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {searchable && (
          <div className="p-2 border-b sticky top-0 bg-popover z-10">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="pl-8 h-8"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              {emptyMessage}
            </div>
          ) : (
            filtered.map((o) => {
              const checked = valueSet.has(o.value)
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      checked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    )}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{o.label}</div>
                    {o.hint && (
                      <div className="text-xs text-muted-foreground truncate">
                        {o.hint}
                      </div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MultiSelect
export { MultiSelect }
