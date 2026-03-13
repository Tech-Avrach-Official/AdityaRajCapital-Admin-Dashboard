import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchCommissionHistory } from "@/modules/partner/store/features/dashboard/dashboardThunk"
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  IndianRupee,
  Percent,
  Download,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import MetricCard from "@/components/common/MetricCard"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0)

const formatDate = (dateStr) => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ─── Status badge — matching StatusBadge style from Investors.jsx ─────────────

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-600 border border-amber-200",
    Icon: Clock,
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    Icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-500 border border-red-200",
    Icon: XCircle,
  },
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.className}`}
    >
      <cfg.Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  )
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

const SkeletonRows = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 7 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
)

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <TableRow>
    <TableCell colSpan={7} className="py-16 text-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Receipt className="h-8 w-8 opacity-30" />
        <p className="text-sm font-medium">No commission records found</p>
        <p className="text-xs opacity-60">
          Records will appear once commissions are generated
        </p>
      </div>
    </TableCell>
  </TableRow>
)

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ limit, offset, total, onPrev, onNext }) => {
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)
  const canPrev = offset > 0
  const canNext = offset + limit < total
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (total === 0) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-foreground">{total}</span> entries
      </p>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={!canPrev}
            className="h-7 px-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!canNext}
            className="h-7 px-2"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function CommissionHistory() {
  const dispatch = useDispatch()

  const { commissionHistory, historyPagination, historyLoading } = useSelector(
    (state) => state.partner.dashboard
  )

  const { limit, offset } = historyPagination

  // Support both {list, total} shape and flat array
  const list = commissionHistory?.list ?? commissionHistory ?? []
  const total = commissionHistory?.total ?? list.length ?? 0

  useEffect(() => {
    dispatch(fetchCommissionHistory({ limit: 10, offset: 0 }))
  }, [dispatch])

  const nextPage = () =>
    dispatch(fetchCommissionHistory({ limit, offset: offset + limit }))
  const prevPage = () =>
    dispatch(fetchCommissionHistory({ limit, offset: Math.max(0, offset - limit) }))

  // Derived summary from current page
  const grossTotal = list.reduce((s, i) => s + (i.amount ?? 0), 0)
  const receivableTotal = list.reduce((s, i) => s + (i.amount_receivable ?? 0), 0)
  const tdsTotal = list.reduce((s, i) => s + (i.tds_amount ?? 0), 0)
  const pendingCount = list.filter((i) => i.status === "pending").length

  const handleExport = () => {
    console.log("Export commission history")
  }

  return (
    <div className="space-y-8 pb-10">

      {/* ── Page header — same pattern as Dashboard.jsx ── */}
      <header className="flex flex-col gap-5 border-b border-border/60 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Commission History
            </h1>
            <p className="text-sm text-muted-foreground">
              All commission records with TDS breakdown
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Metric cards — same MetricCard component as Dashboard ── */}
      {historyLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Gross Commission"
            value={formatINR(grossTotal)}
            icon={TrendingUp}
            iconColor="blue"
          />
          <MetricCard
            title="Net Receivable"
            value={formatINR(receivableTotal)}
            icon={IndianRupee}
            iconColor="green"
          />
          <MetricCard
            title="TDS Deducted"
            value={formatINR(tdsTotal)}
            icon={Percent}
            iconColor="orange"
          />
          <MetricCard
            title="Pending Entries"
            value={pendingCount}
            icon={Clock}
            iconColor="purple"
          />
        </div>
      )}

      {/* ── Table card — same border/rounded-xl/bg-card as Investors.jsx ── */}
      <div className="border rounded-xl bg-card overflow-hidden">

        {/* Card header row */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-base font-semibold">Records</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {historyLoading
                ? "Fetching…"
                : `${list.length} record${list.length !== 1 ? "s" : ""} on this page`}
            </p>
          </div>

          {/* Status legend */}
          <div className="hidden sm:flex items-center gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, { label, className, Icon }]) => (
              <span
                key={key}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}
              >
                <Icon size={11} strokeWidth={2.5} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Investment ID</TableHead>
              <TableHead>Due Window</TableHead>
              <TableHead>Gross Amount</TableHead>
              <TableHead>TDS</TableHead>
              <TableHead>Net Receivable</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {historyLoading ? (
              <SkeletonRows />
            ) : list.length === 0 ? (
              <EmptyState />
            ) : (
              list.map((item, i) => (
                <TableRow key={item.id}>

                  <TableCell className="text-muted-foreground text-xs tabular-nums">
                    {offset + i + 1}
                  </TableCell>

                  <TableCell className="font-mono text-xs font-semibold">
                    {item.investment_display_id}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {item.due_window_label}
                  </TableCell>

                  <TableCell className="font-medium">
                    {formatINR(item.amount)}
                  </TableCell>

                  <TableCell className="text-red-500 text-sm">
                    − {formatINR(item.tds_amount)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({item.tds_percent}%)
                    </span>
                  </TableCell>

                  <TableCell className="font-semibold text-emerald-600">
                    {formatINR(item.amount_receivable)}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={item.status} />
                    {item.paid_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(item.paid_at)}
                      </p>
                    )}
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!historyLoading && (
          <Pagination
            limit={limit}
            offset={offset}
            total={total}
            onPrev={prevPage}
            onNext={nextPage}
          />
        )}

      </div>
    </div>
  )
}