import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { Upload, Eye, ChevronLeft, ChevronRight } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { financialService } from "@/lib/api/services"

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

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "delayed", label: "Delayed" },
  { value: "upcoming", label: "Upcoming" },
  { value: "cancelled", label: "Cancelled" },
]

const formatCurrency = (amount) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const PayoutsPage = () => {
  const now = new Date()
  const [payouts, setPayouts] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  })
  const [filter, setFilter] = useState({ month: null, year: null, slot: null, status: null })
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [slot, setSlot] = useState("all")
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)

  const loadPayouts = useMemo(
    () => async (page = 1) => {
      setLoading(true)
      try {
        const result = await financialService.getPayoutsList({
          month,
          year,
          slot: slot === "all" ? undefined : slot,
          status: status === "all" ? undefined : status,
          page,
          limit: 20,
        })
        setPayouts(result.payouts ?? [])
        setPagination(result.pagination ?? { page: 1, limit: 20, total: 0, total_pages: 0 })
        setFilter(result.filter ?? { month, year, slot: slot === "all" ? null : slot, status: status === "all" ? null : status })
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to load payouts")
        setPayouts([])
        setPagination((p) => ({ ...p, total: 0, total_pages: 0 }))
      } finally {
        setLoading(false)
      }
    },
    [month, year, slot, status]
  )

  useEffect(() => {
    loadPayouts(1)
  }, [loadPayouts])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.total_pages) return
    loadPayouts(newPage)
  }

  const handleUploadPDF = () => {
    toast.info("Upload Bank PDF - To be implemented with file upload modal")
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "investment_display_id",
        header: "Investment ID",
        cell: ({ row }) => {
          const p = row.original
          const to = `/admin/users/investors/${p.investor_id}/investments/${p.investment_id}`
          return (
            <Link to={to} className="font-mono text-sm text-primary hover:underline">
              {p.investment_display_id ?? p.investment_id ?? "—"}
            </Link>
          )
        },
      },
      {
        accessorKey: "installment_number",
        header: "Installment #",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.installment_number ?? "—"}</span>
        ),
      },
      {
        accessorKey: "investor_name",
        header: "Investor",
        cell: ({ row }) => {
          const p = row.original
          const to = `/admin/users/investors/${p.investor_id}`
          return (
            <Link to={to} className="font-medium text-primary hover:underline">
              {p.investor_name ?? "—"}
            </Link>
          )
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
              {b.state_name && (
                <p className="text-xs text-muted-foreground">{b.state_name}</p>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "gross_amount",
        header: "Gross amount",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.gross_amount)}</span>
        ),
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
        accessorKey: "payout_window",
        header: "Payout window",
        cell: ({ row }) => {
          const p = row.original
          const label = p.payout_window_label ?? (p.payout_date_from != null && p.payout_date_to != null
            ? `${p.payout_date_from}–${p.payout_date_to}`
            : null)
          const period = p.period_label
          if (!label && !period) return "—"
          return (
            <div>
              {label && <p className="font-medium">{label}</p>}
              {period && <p className="text-xs text-muted-foreground">{period}</p>}
            </div>
          )
        },
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
              {bank.ifsc && (
                <p className="font-mono text-xs text-muted-foreground">IFSC: {bank.ifsc}</p>
              )}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const p = row.original
          const to = `/admin/users/investors/${p.investor_id}/investments/${p.investment_id}`
          return (
            <Button variant="ghost" size="sm" asChild className="gap-1.5">
              <Link to={to}>
                <Eye className="h-4 w-4" />
                View
              </Link>
            </Button>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: payouts,
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
    if (filter.status != null && filter.status !== "all") {
      const st = STATUS_OPTIONS.find((x) => x.value === filter.status)
      if (st) parts.push(st.label)
    }
    return parts.length ? parts.join(" · ") : "Select month & year"
  }, [filter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payout Management"
        action="Upload Bank PDF"
        actionLabel={
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Bank PDF
          </>
        }
        onActionClick={handleUploadPDF}
      />

      {/* Filters: Month, Year (required), Slot, Status */}
      <div className="rounded-lg border border-border bg-card p-4">
        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Filters</Label>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="payout-month" className="text-xs">Month</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v, 10))}>
              <SelectTrigger id="payout-month" className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payout-year" className="text-xs">Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v, 10))}>
              <SelectTrigger id="payout-year" className="w-[120px]">
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
            <Label htmlFor="payout-slot" className="text-xs">Slot</Label>
            <Select value={slot} onValueChange={setSlot}>
              <SelectTrigger id="payout-slot" className="w-[140px]">
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
            <Label htmlFor="payout-status" className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="payout-status" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Showing: {filterSummary}</p>
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
                      No payouts found.
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page <= 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.total_pages)}
                  disabled={pagination.page >= pagination.total_pages}
                >
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

export default PayoutsPage
