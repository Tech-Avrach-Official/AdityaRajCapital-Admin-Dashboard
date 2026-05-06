// PermissionPicker — grouped checkbox UI over PERMISSION_CATALOG.
// Filters available options to those the current caller holds (super_admin
// sees the full catalog; module.* wildcards expand to their leaves).

import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/modules/admin/hooks"
import {
  PERMISSION_CATALOG,
  MODULE_LABELS,
  hasPermission,
} from "@/modules/admin/lib/permissions"

const PermissionPicker = ({ value = [], onChange, disabled = false }) => {
  const { isSuperAdmin, permissions: heldPerms } = useAuth()
  const [query, setQuery] = useState("")
  const [collapsed, setCollapsed] = useState({})

  const valueSet = useMemo(() => new Set(value), [value])

  const allowedByModule = useMemo(() => {
    const result = {}
    for (const [moduleKey, leaves] of Object.entries(PERMISSION_CATALOG)) {
      const allowedLeaves = isSuperAdmin
        ? leaves
        : leaves.filter((leaf) => hasPermission(heldPerms, leaf))
      if (allowedLeaves.length) result[moduleKey] = allowedLeaves
    }
    return result
  }, [isSuperAdmin, heldPerms])

  const filteredByModule = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allowedByModule
    const result = {}
    for (const [moduleKey, leaves] of Object.entries(allowedByModule)) {
      const matchedModule =
        (MODULE_LABELS[moduleKey] || moduleKey).toLowerCase().includes(q) ||
        moduleKey.toLowerCase().includes(q)
      const matchedLeaves = matchedModule
        ? leaves
        : leaves.filter((l) => l.toLowerCase().includes(q))
      if (matchedLeaves.length) result[moduleKey] = matchedLeaves
    }
    return result
  }, [allowedByModule, query])

  const toggleLeaf = (leaf) => {
    if (valueSet.has(leaf)) {
      onChange?.(value.filter((v) => v !== leaf))
    } else {
      onChange?.([...value, leaf])
    }
  }

  const allCheckedInModule = (leaves) => leaves.every((l) => valueSet.has(l))

  const toggleModule = (leaves) => {
    if (allCheckedInModule(leaves)) {
      onChange?.(value.filter((v) => !leaves.includes(v)))
    } else {
      const merged = new Set(value)
      leaves.forEach((l) => merged.add(l))
      onChange?.(Array.from(merged))
    }
  }

  const totalAllowed = Object.values(allowedByModule).reduce(
    (sum, l) => sum + l.length,
    0
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Permissions</Label>
        <Badge variant="secondary">
          {value.length} / {totalAllowed} selected
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search permissions…"
          className="pl-9"
          disabled={disabled}
        />
      </div>

      <div className="border rounded-md max-h-96 overflow-y-auto divide-y">
        {Object.keys(filteredByModule).length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            No matches.
          </div>
        ) : (
          Object.entries(filteredByModule).map(([moduleKey, leaves]) => {
            const isCollapsed = collapsed[moduleKey]
            const allChecked = allCheckedInModule(leaves)
            const someChecked = leaves.some((l) => valueSet.has(l))
            return (
              <div key={moduleKey}>
                <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm font-medium flex-1 text-left"
                    onClick={() =>
                      setCollapsed((prev) => ({
                        ...prev,
                        [moduleKey]: !prev[moduleKey],
                      }))
                    }
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{MODULE_LABELS[moduleKey] || moduleKey}</span>
                  </button>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => toggleModule(leaves)}
                    disabled={disabled}
                  >
                    {allChecked
                      ? "Clear all"
                      : someChecked
                      ? "Select all"
                      : "Select all"}
                  </button>
                </div>
                {!isCollapsed && (
                  <div className="px-3 py-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    {leaves.map((leaf) => {
                      const checked = valueSet.has(leaf)
                      const action = leaf.replace(`${moduleKey}.`, "")
                      return (
                        <button
                          key={leaf}
                          type="button"
                          onClick={() => toggleLeaf(leaf)}
                          className="flex items-center gap-2 text-sm py-1.5 hover:bg-accent/50 rounded px-1 -mx-1 text-left"
                          disabled={disabled}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                              checked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input"
                            )}
                          >
                            {checked && (
                              <svg
                                className="h-3 w-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="font-mono text-xs truncate">
                            {action}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      {!isSuperAdmin && (
        <p className="text-xs text-muted-foreground">
          Only permissions you currently hold are listed here.
        </p>
      )}
    </div>
  )
}

export default PermissionPicker
