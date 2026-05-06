// ScopePicker — renders the role-appropriate multi-select for staff scope.
// Pre-filters options to the caller's effective scope when the caller is not
// super_admin. Backend re-validates regardless.

import { useEffect, useMemo, useState } from "react"
import MultiSelect from "@/components/ui/multi-select"
import { Label } from "@/components/ui/label"
import { hierarchyService } from "@/modules/admin/api/services/hierarchyService"
import { useAuth } from "@/modules/admin/hooks"
import { ROLE_SCOPE_KEY } from "@/modules/admin/api/services/staffService"

const buildOptions = (rows, key) =>
  rows.map((r) => ({
    value: r.id,
    label: r.name,
    hint:
      key === "branches"
        ? [r.state_name, r.nation_name].filter(Boolean).join(" • ")
        : key === "states"
        ? r.nation_name || undefined
        : undefined,
  }))

const ScopePicker = ({ targetRole, value, onChange, disabled }) => {
  const scopeKey = ROLE_SCOPE_KEY[targetRole] // "nations" | "states" | "branches"
  const { isSuperAdmin, scope } = useAuth()
  const [nations, setNations] = useState([])
  const [states, setStates] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        if (scopeKey === "nations") {
          const { nations: list } = await hierarchyService.getNations()
          if (!cancelled) setNations(list)
        } else if (scopeKey === "states") {
          const [{ nations: ns }, { states: ss }] = await Promise.all([
            hierarchyService.getNations(),
            hierarchyService.getStates(),
          ])
          if (!cancelled) {
            setNations(ns)
            setStates(ss)
          }
        } else if (scopeKey === "branches") {
          const [{ nations: ns }, { states: ss }, { branches: bs }] =
            await Promise.all([
              hierarchyService.getNations(),
              hierarchyService.getStates(),
              hierarchyService.getBranches(),
            ])
          if (!cancelled) {
            setNations(ns)
            setStates(ss)
            setBranches(bs)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [scopeKey])

  const options = useMemo(() => {
    if (scopeKey === "nations") {
      let pool = nations
      if (!isSuperAdmin && Array.isArray(scope?.nations) && scope.nations.length) {
        const allowed = new Set(scope.nations)
        pool = pool.filter((n) => allowed.has(n.id))
      }
      return buildOptions(pool, "nations")
    }
    if (scopeKey === "states") {
      let pool = states
      if (!isSuperAdmin) {
        if (scope?.states?.length) {
          const allowed = new Set(scope.states)
          pool = pool.filter((s) => allowed.has(s.id))
        } else if (scope?.nations?.length) {
          const allowedNations = new Set(scope.nations)
          pool = pool.filter((s) => allowedNations.has(s.nation_id))
        }
      }
      return buildOptions(pool, "states")
    }
    if (scopeKey === "branches") {
      let pool = branches
      if (!isSuperAdmin) {
        if (scope?.branches?.length) {
          const allowed = new Set(scope.branches)
          pool = pool.filter((b) => allowed.has(b.id))
        } else if (scope?.states?.length) {
          const allowedStates = new Set(scope.states)
          pool = pool.filter((b) => allowedStates.has(b.state_id))
        } else if (scope?.nations?.length) {
          const allowedNations = new Set(scope.nations)
          // Map branch -> state -> nation via the states list.
          const stateNation = new Map(states.map((s) => [s.id, s.nation_id]))
          pool = pool.filter((b) =>
            allowedNations.has(stateNation.get(b.state_id))
          )
        }
      }
      return buildOptions(pool, "branches")
    }
    return []
  }, [scopeKey, nations, states, branches, isSuperAdmin, scope])

  const labelText = {
    nations: "Nations",
    states: "States",
    branches: "Branches",
  }[scopeKey]

  return (
    <div className="space-y-2">
      <Label>{labelText}</Label>
      <MultiSelect
        options={options}
        value={value || []}
        onChange={onChange}
        placeholder={loading ? "Loading…" : `Select ${labelText?.toLowerCase()}…`}
        disabled={disabled || loading}
      />
      {!isSuperAdmin && (
        <p className="text-xs text-muted-foreground">
          Only options inside your scope are shown.
        </p>
      )}
    </div>
  )
}

export default ScopePicker
