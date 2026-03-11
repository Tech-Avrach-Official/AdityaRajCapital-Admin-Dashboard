import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { ChevronLeft, ChevronRight, Upload, Download } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import StatusBadge from "@/components/common/StatusBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { financialService } from "@/modules/admin/api/services/financialService"

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

const SLOTS = [
  { value: "all", label: "All slots" },
  { value: "1", label: "1–10" },
  { value: "2", label: "11–20" },
  { value: "3", label: "21–30" },
]

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "partner", label: "Partner" },
  { value: "rm", label: "RM" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "delayed", label: "Delayed" },
  { value: "upcoming", label: "Upcoming" },
]

const formatCurrency = (amount) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const CommissionsPage = () => {
  const now = new Date()
  const [commissions, setCommissions] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  })
  const [filter, setFilter] = useState({ month: null, year: null, slot: null, type: null, status: null, commission_id: null })
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [slot, setSlot] = useState("all")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [commissionIdSearch, setCommissionIdSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const loadCommissions = useMemo(
    () => async (page = 1, commissionId = null) => {
      setLoading(true)
      try {
        const idParam = commissionId != null ? commissionId : (commissionIdSearch.trim() ? parseInt(commissionIdSearch.trim(), 10) : undefined)
        const result = await financialService.getCommissionsList({
          month,
          year,
          slot: slot === "all" ? undefined : slot,
          type: type === "all" ? undefined : type,
          status: status === "all" ? undefined : status,
          commission_id: idParam || undefined,
          page,
          limit: 20,
        })
        setCommissions(result.commissions ?? [])
        setPagination(result.pagination ?? { page: 1, limit: 20, total: 0, total_pages: 0 })
        setFilter(result.filter ?? { month, year, slot: slot === "all" ? null : slot, type: type === "all" ? null : type, status: status === "all" ? null : status, commission_id: idParam ?? null })
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to load commissions")
        setCommissions([])
        setPagination((p) => ({ ...p, total: 0, total_pages: 0 }))
      } finally {
        setLoading(false)
      }
    },
    [month, year, slot, type, status]
  )

  useEffect(() => {
    loadCommissions(1)
  }, [loadCommissions])

  const handleSearchById = () => {
    const id = commissionIdSearch.trim() ? parseInt(commissionIdSearch.trim(), 10) : null
    if (commissionIdSearch.trim() && (Number.isNaN(id) || id < 1)) {
      toast.error("Enter a valid commission ID")
      return
    }
    loadCommissions(1, id ?? undefined)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.total_pages) return
    loadCommissions(newPage)
  }

  const handleExport = () => {
    if (!commissions.length) {
      toast.error("No commissions to export")
      return
    }
    const escapeCsvCell = (val) => {
      const s = String(val ?? "")
      if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const headers = [
      "Commission ID",
      "Type",
      "Payee",
      "Investment ID",
      "Amount",
      "TDS %",
      "Receivable",
      "Due window",
      "Payment timing",
      "Branch",
      "Bank (holder)",
      "Bank name",
      "Account number",
    ]
    const rows = commissions.map((c) => {
      const b = c.branch
      const branchName = b ? (b.name ?? "") : ""
      const bank = c.bank_account
      const tdsPct = c.tds_percent != null ? `${c.tds_percent}%` : ""
      return [
        String(c.commission_id ?? c.id ?? ""),
        c.type ?? "",
        c.payee_name ?? "",
        c.investment_display_id ?? c.investment_id ?? "",
        formatCurrency(c.amount),
        tdsPct,
        formatCurrency(c.receivable_amount),
        c.due_window_label ?? "",
        c.payment_timing ?? c.status ?? "",
        branchName,
        bank?.account_holder_name ?? "",
        bank?.bank_name ?? "",
        bank?.account_number ?? "",
      ]
    })
    const csvRows = [headers.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))]
    const csv = "\uFEFF" + csvRows.join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `commissions-export-${new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Commissions exported successfully")
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "commission_id",
        header: "Commission ID",
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium">{row.original.commission_id ?? row.original.id ?? "—"}</span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const t = row.original.type
          return (
            <StatusBadge
              status={t === "partner" ? "active" : t === "rm" ? "default" : "secondary"}
              customLabel={t === "partner" ? "Partner" : t === "rm" ? "RM" : t ?? "—"}
            />
          )
        },
      },
      {
        accessorKey: "payee_name",
        header: "Payee",
        cell: ({ row }) => {
          const c = row.original
          const name = c.payee_name ?? "—"
          if (c.type === "partner" && c.partner_id != null) {
            return (
              <Link to={`/admin/users/partners/${c.partner_id}`} className="font-medium text-primary hover:underline">
                {name}
              </Link>
            )
          }
          if (c.type === "rm" && c.rm_id != null) {
            return (
              <Link to="/admin/users/rms" className="font-medium text-primary hover:underline">
                {name}
              </Link>
            )
          }
          return <span className="font-medium">{name}</span>
        },
      },
      {
        accessorKey: "investment_display_id",
        header: "Investment ID",
        cell: ({ row }) => {
          const c = row.original
          const displayId = c.investment_display_id ?? c.investment_id ?? "—"
          if (c.investor_id != null) {
            const to = `/admin/users/investors/${c.investor_id}/investments/${c.investment_id}`
            return (
              <Link to={to} className="font-mono text-sm text-primary hover:underline">
                {displayId}
              </Link>
            )
          }
          return <span className="font-mono text-sm">{displayId}</span>
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "tds_percent",
        header: "TDS %",
        cell: ({ row }) => {
          const pct = row.original.tds_percent
          return <span className="tabular-nums">{pct != null ? `${pct}%` : "—"}</span>
        },
      },
      {
        accessorKey: "receivable_amount",
        header: "Receivable",
        cell: ({ row }) => (
          <span className="tabular-nums font-medium">
            {formatCurrency(row.original.receivable_amount)}
          </span>
        ),
      },
      {
        accessorKey: "due_window_label",
        header: "Due window",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.due_window_label ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "payment_timing",
        header: "Payment timing",
        cell: ({ row }) => {
          const timing = row.original.payment_timing ?? row.original.status
          return <StatusBadge status={timing} />
        },
      },
      {
        accessorKey: "branch",
        header: "Branch",
        cell: ({ row }) => {
          const b = row.original.branch
          if (!b) return <span className="text-muted-foreground">—</span>
          return (
            <div>
              <p className="font-medium">{b.name ?? "—"}</p>
              {b.state_name && <p className="text-xs text-muted-foreground">{b.state_name}</p>}
            </div>
          )
        },
      },
      {
        accessorKey: "bank_account",
        header: "Bank",
        cell: ({ row }) => {
          const bank = row.original.bank_account
          if (!bank) return <span className="text-muted-foreground">—</span>
          return (
            <div className="text-sm max-w-[200px]">
              <p className="font-medium truncate" title={bank.account_holder_name}>
                {bank.account_holder_name ?? "—"}
              </p>
              <p className="text-muted-foreground truncate">{bank.bank_name ?? "—"}</p>
              <p className="font-mono text-xs text-muted-foreground truncate">
                {bank.account_number ?? "—"}
              </p>
              {bank.ifsc && <p className="font-mono text-xs text-muted-foreground">IFSC: {bank.ifsc}</p>}
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: commissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const filterSummary = useMemo(() => {
    const parts = []
    if (filter.month != null && filter.year != null) {
      const m = MONTHS.find((x) => x.value === filter.month)
      parts.push(m ? `${m.label} ${filter.year}` : `${filter.month}/${filter.year}`)
    }
    if (filter.slot != null && filter.slot !== "all") {
      const s = SLOTS.find((x) => x.value === String(filter.slot))
      if (s) parts.push(`Slot ${s.label}`)
    }
    if (filter.type != null && filter.type !== "all") {
      const t = TYPE_OPTIONS.find((x) => x.value === filter.type)
      if (t) parts.push(t.label)
    }
    if (filter.status != null && filter.status !== "all") {
      const st = STATUS_OPTIONS.find((x) => x.value === filter.status)
      if (st) parts.push(st.label)
    }
    if (filter.commission_id != null) parts.push(`ID ${filter.commission_id}`)
    return parts.length ? parts.join(" · ") : "Select month & year"
  }, [filter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commissions"
        action="Upload Bank PDF"
        actionHref="/admin/financial/commissions/upload"
        actionLabel={
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Bank PDF
          </>
        }
      />

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4">
        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Filters</Label>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="comm-month" className="text-xs">Month</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v, 10))}>
              <SelectTrigger id="comm-month" className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comm-year" className="text-xs">Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v, 10))}>
              <SelectTrigger id="comm-year" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[year, year - 1, year - 2, year + 1].sort((a, b) => b - a).map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comm-slot" className="text-xs">Slot</Label>
            <Select value={slot} onValueChange={setSlot}>
              <SelectTrigger id="comm-slot" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SLOTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comm-type" className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="comm-type" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comm-status" className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="comm-status" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comm-id" className="text-xs">Commission ID</Label>
            <div className="flex gap-2">
              <Input
                id="comm-id"
                type="number"
                placeholder="ID"
                value={commissionIdSearch}
                onChange={(e) => setCommissionIdSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchById()}
                className="w-[100px]"
              />
              <Button variant="secondary" size="sm" onClick={handleSearchById}>
                Search
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Showing: {filterSummary}</p>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={!commissions.length}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-md border p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No commissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.total_pages}
                {pagination.total != null && <> · {pagination.total} total</>}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={pagination.page <= 1}>
                  First
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.total_pages}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.total_pages)} disabled={pagination.page >= pagination.total_pages}>
                  Last
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CommissionsPage
