import React, { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, LayoutDashboard, UserCog, Handshake, Users, Package, Building2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { runGlobalSearch } from "@/modules/admin/api/services/globalSearchService"
import { cn } from "@/lib/utils"

const DEBOUNCE_MS = 280

const sectionIcons = {
  page: LayoutDashboard,
  rm: UserCog,
  partner: Handshake,
  investor: Users,
  plan: Package,
  branch: Building2,
}

/** Build a flat list of selectable items from search result for keyboard nav */
function buildFlatItems(result) {
  const items = []
  if ((result.pages || []).length) {
    result.pages.forEach((p) => {
      items.push({ type: "page", label: p.label, subtitle: null, path: p.path, raw: p })
    })
  }
  if ((result.rms || []).length) {
    result.rms.forEach((r) => {
      const name = r.rm_name ?? r.name ?? "—"
      const code = r.rm_code ?? r.referralCode ?? ""
      items.push({
        type: "rm",
        label: name,
        subtitle: code || r.email,
        path: `/admin/users/rms/${r.id}`,
        raw: r,
      })
    })
  }
  if ((result.partners || []).length) {
    result.partners.forEach((p) => {
      const name = p.name ?? "—"
      const code = p.partner_referral_code ?? p.referral_code ?? p.email
      items.push({
        type: "partner",
        label: name,
        subtitle: code,
        path: `/admin/users/partners/${p.id}`,
        raw: p,
      })
    })
  }
  if ((result.investors || []).length) {
    result.investors.forEach((i) => {
      const name = i.name ?? "—"
      const sub = i.client_id ?? i.email
      items.push({
        type: "investor",
        label: name,
        subtitle: sub,
        path: `/admin/users/investors/${i.id}`,
        raw: i,
      })
    })
  }
  if ((result.plans || []).length) {
    result.plans.forEach((p) => {
      items.push({
        type: "plan",
        label: p.name ?? p.slug ?? "—",
        subtitle: p.slug ?? null,
        path: `/admin/plans/${p.id}`,
        raw: p,
      })
    })
  }
  if ((result.branches || []).length) {
    result.branches.forEach((b) => {
      items.push({
        type: "branch",
        label: b.name ?? "—",
        subtitle: b.code ?? b.state_name ?? null,
        path: "/admin/hierarchy/branches",
        raw: b,
      })
    })
  }
  return items
}

/** Section labels for display */
const sectionLabels = {
  page: "Pages",
  rm: "Relationship Managers",
  partner: "Partners",
  investor: "Investors",
  plan: "Plans",
  branch: "Branches",
}

const GlobalSearch = ({ className }) => {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const debounceRef = useRef(null)
  const selectedItemRef = useRef(null)

  const items = result ? buildFlatItems(result) : []
  const hasResults = items.length > 0

  const runSearch = useCallback(async (q) => {
    if (q == null) return
    setLoading(true)
    try {
      const data = await runGlobalSearch(q)
      setResult(data)
      setSelectedIndex(0)
    } catch {
      setResult({ pages: [], rms: [], partners: [], investors: [], plans: [], branches: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length === 0) {
      setResult(null)
      setSelectedIndex(0)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(q), DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, runSearch])

  useEffect(() => {
    setSelectedIndex((prev) => (items.length ? Math.min(prev, items.length - 1) : 0))
  }, [items.length])

  // Scroll selected item into view when using keyboard
  useEffect(() => {
    if (items.length && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedIndex, items.length])

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (item) => {
    navigate(item.path)
    setQuery("")
    setIsOpen(false)
    setResult(null)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (!isOpen && e.key !== "Escape") {
      setIsOpen(true)
      return
    }
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
      return
    }
    if (e.key === "Enter" && items[selectedIndex]) {
      e.preventDefault()
      handleSelect(items[selectedIndex])
    }
  }

  const showDropdown = isOpen && (query.trim().length > 0 || loading)

  return (
    <div ref={containerRef} className={cn("relative flex-1 max-w-xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search RMs, partners, investors, plans, branches or go to page..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 bg-muted/30 focus:bg-background"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          role="combobox"
        />
      </div>

      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg z-[100] overflow-hidden"
          role="listbox"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="py-6 px-4 text-center text-sm text-muted-foreground">
              No results for &quot;{query.trim()}&quot;
            </div>
          ) : (
            <div className="max-h-[min(70vh,400px)] overflow-y-auto overflow-x-hidden overscroll-contain">
              <div className="p-1">
                {items.map((item, idx) => {
                  const Icon = sectionIcons[item.type]
                  const isSelected = idx === selectedIndex
                  return (
                    <button
                      ref={isSelected ? selectedItemRef : null}
                      key={`${item.type}-${item.raw?.id ?? item.path}-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/80 text-foreground"
                      )}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(item)}
                    >
                      {Icon && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{item.label}</p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                        )}
                      </div>
                      <span className="text-[10px] uppercase text-muted-foreground shrink-0">
                        {sectionLabels[item.type]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>↑↓ Navigate</span>
            <span>Enter to go</span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
