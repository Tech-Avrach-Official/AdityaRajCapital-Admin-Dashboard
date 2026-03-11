import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Eye, ChevronLeft, ChevronRight, Download } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { financialService } from "@/modules/admin/api/services/financialService"

const PERIODS = [
  { value: "overall", label: "Overall" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom range" },
]

const formatCurrency = (amount) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDateOnly = (d) => {
  if (d == null || d === "") return "—"
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return "—"
  return format(date, "dd MMM yyyy")
}

const InvestmentsPage = () => {
  const [investments, setInvestments] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  })
  const [filter, setFilter] = useState({ period: "overall", from_date: null, to_date: null })
  const [period, setPeriod] = useState("overall")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [loading, setLoading] = useState(true)

  const loadInvestments = useMemo(
    () => async (page = 1) => {
      setLoading(true)
      try {
        const params = { period, page, limit: 20 }
        if (period === "custom") {
          if (!fromDate || !toDate) {
            toast.error("Please select from and to date for custom range")
            setLoading(false)
            return
          }
          params.from_date = fromDate
          params.to_date = toDate
        }
        const result = await financialService.getInvestmentsList(params)
        setInvestments(result.investments ?? [])
        setPagination(result.pagination ?? { page: 1, limit: 20, total: 0, total_pages: 0 })
        setFilter(result.filter ?? { period, from_date: fromDate || null, to_date: toDate || null })
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load investments")
        setInvestments([])
        setPagination((p) => ({ ...p, total: 0, total_pages: 0 }))
      } finally {
        setLoading(false)
      }
    },
    [period, fromDate, toDate]
  )

  useEffect(() => {
    if (period !== "custom") {
      loadInvestments(1)
    }
  }, [period, loadInvestments])

  const handleApplyCustom = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to date")
      return
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From date must be before or equal to to date")
      return
    }
    setPeriod("custom")
    setLoading(true)
    try {
      const result = await financialService.getInvestmentsList({
        period: "custom",
        from_date: fromDate,
        to_date: toDate,
        page: 1,
        limit: 20,
      })
      setInvestments(result.investments ?? [])
      setPagination(result.pagination ?? { page: 1, limit: 20, total: 0, total_pages: 0 })
      setFilter(result.filter ?? { period: "custom", from_date: fromDate, to_date: toDate })
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load investments")
      setInvestments([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.total_pages) return
    loadInvestments(newPage)
  }

  const handleExport = () => {
    if (!investments.length) {
      toast.error("No investments to export")
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
      "Investment ID",
      "Investor",
      "Plan",
      "Amount",
      "Date",
      "Status",
      "Total received",
      "Next payout",
    ]
    const rows = investments.map((inv) => {
      const invName = inv.investor?.name ?? "—"
      const planName = inv.plan?.name ?? "—"
      const d = inv.payment_verified_at ?? inv.created_at
      const dateStr = formatDateOnly(d)
      const totalRec = inv.investment_return?.total_received_display ?? (inv.investment_return?.total_received != null ? formatCurrency(inv.investment_return.total_received) : "—")
      const np = inv.next_payout
      const nextPayoutStr = np
        ? (np.payout_date_from != null && np.payout_date_to != null
          ? `${np.payout_date_from} – ${np.payout_date_to}`
          : np.payout_date_from ?? np.payout_date_to ?? inv.next_payout_date ?? "—")
        : "—"
      return [
        inv.investment_display_id ?? inv.id ?? "",
        invName,
        planName,
        formatCurrency(inv.amount),
        dateStr,
        inv.status ?? "",
        totalRec,
        nextPayoutStr,
      ]
    })
    const csvRows = [headers.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))]
    const csv = "\uFEFF" + csvRows.join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `investments-export-${new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Investments exported successfully")
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "investment_display_id",
        header: "Investment ID",
        cell: ({ row }) => {
          const inv = row.original
          const to = `/admin/users/investors/${inv.investor_id}/investments/${inv.id}`
          return (
            <Link to={to} className="font-mono text-sm text-primary hover:underline">
              {inv.investment_display_id ?? inv.id ?? "—"}
            </Link>
          )
        },
      },
      {
        accessorKey: "investor",
        header: "Investor",
        cell: ({ row }) => {
          const inv = row.original.investor
          if (!inv) return "—"
          const to = `/admin/users/investors/${row.original.investor_id}`
          return (
            <div>
              <Link to={to} className="font-medium text-primary hover:underline">
                {inv.name ?? "—"}
              </Link>
              {inv.client_id && (
                <p className="text-xs text-muted-foreground font-mono">{inv.client_id}</p>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => {
          const plan = row.original.plan
          if (!plan) return "—"
          const to = `/admin/plans/${row.original.plan_id}`
          return (
            <Link to={to} className="text-primary hover:underline">
              {plan.name ?? "—"}
            </Link>
          )
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="tabular-nums font-medium">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          const d = row.original.payment_verified_at ?? row.original.created_at
          return <span className="text-muted-foreground text-sm">{formatDateOnly(d)}</span>
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "investment_return",
        header: "Total received",
        cell: ({ row }) => {
          const ir = row.original.investment_return
          if (ir == null) return "—"
          if (ir.total_received_display) return <span className="tabular-nums font-medium">{ir.total_received_display}</span>
          if (ir.total_received != null) return <span className="tabular-nums font-medium">{formatCurrency(ir.total_received)}</span>
          return "—"
        },
      },
      {
        accessorKey: "next_payout",
        header: "Next payout",
        cell: ({ row }) => {
          const np = row.original.next_payout
          if (!np) return <span className="text-muted-foreground">—</span>
          const amt = np.receivable_amount ?? np.amount
          const from = np.payout_date_from != null ? String(np.payout_date_from) : ""
          const to = np.payout_date_to != null ? String(np.payout_date_to) : ""
          const dateRange = from && to ? `${from} – ${to}` : from || to || (row.original.next_payout_date != null ? String(row.original.next_payout_date) : "")
          return (
            <div>
              <span className="tabular-nums font-medium">{formatCurrency(amt)}</span>
              {dateRange && <p className="text-xs text-muted-foreground">{dateRange}</p>}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const inv = row.original
          const to = `/admin/users/investors/${inv.investor_id}/investments/${inv.id}`
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
    data: investments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const filterLabel = useMemo(() => {
    if (filter.period === "overall") return "All investments"
    if (filter.period === "week") return "This week"
    if (filter.period === "month") return "This month"
    if (filter.period === "custom" && filter.from_date && filter.to_date) {
      return `${formatDateOnly(filter.from_date)} – ${formatDateOnly(filter.to_date)}`
    }
    return "Investments"
  }, [filter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Investments"
        action="Export"
        actionLabel={
          <>
            <Download className="mr-2 h-4 w-4" />
            Export
          </>
        }
        onActionClick={handleExport}
      />

      {/* Period filter */}
      <div className="rounded-lg border border-border bg-card p-4">
        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Filter by period</Label>
        <Tabs
          value={period}
          onValueChange={(v) => {
            setPeriod(v)
            if (v !== "custom") {
              setFromDate("")
              setToDate("")
            }
          }}
        >
          <TabsList className="grid w-full max-w-md grid-cols-4">
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="custom" className="mt-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_date" className="text-xs">From date</Label>
                <Input
                  id="from_date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_date" className="text-xs">To date</Label>
                <Input
                  id="to_date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
              <Button onClick={handleApplyCustom} disabled={!fromDate || !toDate}>
                Apply
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <p className="mt-2 text-sm text-muted-foreground">Showing: {filterLabel}</p>
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
                      No investments found.
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
                {pagination.total != null && (
                  <> · {pagination.total} total</>
                )}
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

export default InvestmentsPage
