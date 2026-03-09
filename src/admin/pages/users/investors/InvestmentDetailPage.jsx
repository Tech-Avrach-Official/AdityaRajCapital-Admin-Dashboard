import React from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  FileText,
  Eye,
  Wallet,
  Calendar,
  Building2,
  Users,
  Receipt,
  Image,
  Clock,
  ChevronRight,
  User,
  Percent,
  Phone,
  Banknote,
} from "lucide-react"
import StatusBadge from "@/components/common/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { mockInvestmentDetail, getMockInvestorById } from "@/lib/mockData/investors"
import { cn } from "@/lib/utils"

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—"

const formatINR = (amount) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

const InvestmentDetailPage = () => {
  const { investorId, investmentId } = useParams()

  const investment = { ...mockInvestmentDetail }
  const investor = getMockInvestorById(investorId) || {
    id: investorId,
    client_id: investment.investor_client_id,
    name: investment.investor_name,
  }

  const displayName = investment.investor_name || investment.investor_client_id || "Investor"

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link to="/admin/users/investors" className="hover:text-foreground transition-colors">
          Investors
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <Link
          to={`/admin/users/investors/${investor.id || investorId}`}
          className="hover:text-foreground transition-colors truncate max-w-[180px]"
        >
          {displayName}
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-foreground truncate">
          {investment.display_id || investment.investment_id}
        </span>
      </nav>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-lg">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Button variant="ghost" size="sm" asChild className="-ml-2 shrink-0">
              <Link
                to={`/admin/users/investors/${investor.id || investorId}`}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to investor
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/10 text-primary">
                <Wallet className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {investment.display_id || investment.investment_id}
                </h1>
                <p className="mt-0.5 text-lg font-medium text-muted-foreground">
                  {investment.plan_name}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <StatusBadge status={investment.status || "active"} />
                  <span className="text-2xl font-bold tabular-nums text-foreground">
                    {formatINR(investment.amount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-4 py-3 backdrop-blur-sm max-w-md">
              <User className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Investor</p>
                <Link
                  to={`/admin/users/investors/${investor.id || investorId}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {displayName}
                </Link>
                {investment.investor_client_id && (
                  <span className="ml-2 font-mono text-sm text-muted-foreground">
                    {investment.investor_client_id}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Investment summary */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            Investment summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Display ID",
                value: investment.summary?.display_id || investment.display_id,
                mono: true,
              },
              { label: "Plan name", value: investment.summary?.plan_name || investment.plan_name },
              {
                label: "Amount",
                value: formatINR(investment.summary?.amount ?? investment.amount),
                highlight: true,
              },
              {
                label: "Status",
                node: <StatusBadge status={investment.summary?.status || investment.status} />,
              },
              {
                label: "Initialized",
                value: formatDate(investment.summary?.initialized_at || investment.initialized_at),
              },
              {
                label: "Payment proof uploaded",
                value: formatDate(investment.summary?.payment_proof_uploaded_at || investment.payment_proof_uploaded_at),
              },
              {
                label: "Payment verified",
                value: formatDate(investment.summary?.payment_verified_at || investment.payment_verified_at),
              },
              {
                label: "Cheque number",
                value: investment.summary?.cheque_number ?? investment.cheque_number ?? "—",
              },
              {
                label: "Partner",
                value: investment.summary?.partner ?? investment.partner,
                span: 2,
              },
            ].map(({ label, value, node, mono, highlight, span }) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl border border-border/60 bg-muted/10 p-4",
                  span === 2 && "sm:col-span-2"
                )}
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                {node ?? (
                  <p
                    className={cn(
                      "font-medium",
                      mono && "font-mono text-sm",
                      highlight && "text-lg tabular-nums text-foreground"
                    )}
                  >
                    {value || "—"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Plan snapshot */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            Plan snapshot (at time of investment)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-violet-50/80 dark:bg-violet-950/20 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Plan name</p>
              <p className="font-semibold">{investment.plan_snapshot?.plan_name || "—"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-emerald-50/80 dark:bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Monthly return</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-foreground">
                {investment.plan_snapshot?.monthly_return_percent ?? "—"}%
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-emerald-50/80 dark:bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Maturity return</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-foreground">
                {investment.plan_snapshot?.maturity_return_percent ?? "—"}%
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-blue-50/80 dark:bg-blue-950/20 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
              <p className="font-semibold">
                {investment.plan_snapshot?.duration_months ?? "—"} months
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-blue-50/80 dark:bg-blue-950/20 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Min amount</p>
              <p className="font-semibold tabular-nums">
                {formatINR(investment.plan_snapshot?.min_amount)}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-blue-50/80 dark:bg-blue-950/20 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Tenure</p>
              <p className="font-semibold">{investment.plan_snapshot?.tenure || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Bank account for this investment */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            Bank account for this investment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Payouts for this investment are credited to:
          </p>
          {investment.bank_for_investment ? (
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50/80 to-background dark:from-emerald-950/20 dark:to-background p-5 shadow-sm max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-semibold">{investment.bank_for_investment.bank_name || "—"}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Account number</p>
                  <p className="font-mono font-semibold">
                    {investment.bank_for_investment.account_number || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">IFSC</p>
                  <p className="font-mono font-semibold">
                    {investment.bank_for_investment.ifsc || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Branch</p>
                  <p className="font-semibold">{investment.bank_for_investment.branch || "—"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
              Not set
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Nominees */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            Investor&apos;s nominee(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {investment.nominees?.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {investment.nominees.map((n, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Avatar className="h-12 w-12 rounded-xl border-2 border-primary/10 bg-primary/10 text-base font-semibold text-primary">
                    <AvatarFallback>{getInitials(n.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{n.name || "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {n.relationship || "—"} · Share {n.share_percent ?? "—"}%
                    </p>
                    {n.contact && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {n.contact}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
              No nominees.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Installments */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Banknote className="h-5 w-5" />
            </div>
            Installments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {investment.installments?.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold w-12">#</TableHead>
                      <TableHead className="font-semibold">Period</TableHead>
                      <TableHead className="font-semibold">Payout window</TableHead>
                      <TableHead className="text-right font-semibold">Gross (₹)</TableHead>
                      <TableHead className="font-semibold">TDS %</TableHead>
                      <TableHead className="text-right font-semibold">TDS (₹)</TableHead>
                      <TableHead className="text-right font-semibold">Receivable (₹)</TableHead>
                      <TableHead className="font-semibold w-24">Status</TableHead>
                      <TableHead className="font-semibold">Paid at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investment.installments.map((row, idx) => (
                      <TableRow
                        key={row.seq}
                        className={cn(
                          idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                          "transition-colors hover:bg-muted/30"
                        )}
                      >
                        <TableCell className="font-medium">{row.seq}</TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.payout_window}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatINR(row.gross)}</TableCell>
                        <TableCell>{row.tds_percent}%</TableCell>
                        <TableCell className="text-right tabular-nums">{formatINR(row.tds_amount)}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{formatINR(row.receivable)}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={row.status}
                            customLabel={
                              row.status === "paid" ? "Paid" : row.status === "pending" ? "Pending" : "Cancelled"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(row.paid_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {investment.installment_summary && (
                <div className="mt-5 flex flex-wrap items-center gap-6 rounded-xl border border-border/60 bg-primary/5 px-5 py-4">
                  <span className="font-semibold tabular-nums">
                    Total gross: {formatINR(investment.installment_summary.total_gross)}
                  </span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    Total TDS: {formatINR(investment.installment_summary.total_tds)}
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    Total receivable: {formatINR(investment.installment_summary.total_receivable)}
                  </span>
                  <span className="ml-auto rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Pending: {investment.installment_summary.pending_count} · Paid:{" "}
                    {investment.installment_summary.paid_count}
                    {investment.installment_summary.cancelled_count > 0 &&
                      ` · Cancelled: ${investment.installment_summary.cancelled_count}`}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
              No installments yet. Generated after deed is signed.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6 & 7. Deed + Payment proof (side by side) */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              Deed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {investment.deed_signed ? (
              <Button variant="outline" size="default" className="gap-2 shadow-sm">
                <Eye className="h-4 w-4" />
                View deed
              </Button>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
                Deed not signed yet.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Image className="h-5 w-5" />
              </div>
              Payment proof
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {investment.payment_proof_uploaded ? (
              <Button variant="outline" size="default" className="gap-2 shadow-sm">
                <Eye className="h-4 w-4" />
                View payment proof
              </Button>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
                Not uploaded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 8. Timeline */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {investment.timeline?.length > 0 ? (
            <div className="relative pl-2">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
              <ul className="space-y-0">
                {investment.timeline.map((item, idx) => (
                  <li key={idx} className="relative flex gap-5 pb-8 last:pb-0">
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground text-xs font-semibold shadow">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-muted/10 px-4 py-3">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.date}
                        {item.time && (
                          <span className="ml-2 font-medium text-foreground/80">{item.time}</span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
              No timeline events.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InvestmentDetailPage
