import React, { useState, useEffect, useMemo } from "react"
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
import { toast } from "react-hot-toast"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { usersService } from "@/modules/admin/api/services/usersService"
import { purchasesService } from "@/modules/admin/api/services/purchasesService"
import NomineeDocumentsModal from "./components/NomineeDocumentsModal"
import PaymentProofModal from "@/modules/admin/pages/financial/payment-verification/components/PaymentProofModal"
import { cn, getProfileImageUrl } from "@/lib/utils"

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

/** Map API installments to table rows */
function mapInstallments(apiInstallments) {
  const list = apiInstallments?.installments ?? []
  return list.map((row) => ({
    seq: row.installment_number ?? row.installment_id ?? 0,
    period: row.period_label ?? row.period ?? "—",
    payout_window: row.payout_window_label ?? row.payout_window ?? "—",
    gross: row.gross_amount ?? row.gross ?? 0,
    tds_percent: row.tds_percent ?? 0,
    tds_amount: row.tds_amount ?? 0,
    receivable: row.receivable_amount ?? row.receivable ?? 0,
    status: row.status ?? "pending",
    paid_at: row.paid_at ?? null,
  }))
}

const InvestmentDetailPage = () => {
  const { investorId, investmentId: purchaseId } = useParams()
  const [purchase, setPurchase] = useState(null)
  const [installmentsData, setInstallmentsData] = useState(null)
  const [nominees, setNominees] = useState([])
  const [loading, setLoading] = useState(true)
  const [deedLoading, setDeedLoading] = useState(false)
  const [nomineeModalNominee, setNomineeModalNominee] = useState(null)
  const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false)

  useEffect(() => {
    if (!purchaseId) {
      setLoading(false)
      return
    }
    setLoading(true)
    purchasesService
      .getPurchase(purchaseId)
      .then((data) => setPurchase(data ?? null))
      .catch(() => {
        toast.error("Failed to load investment")
        setPurchase(null)
      })
      .finally(() => setLoading(false))
  }, [purchaseId])

  useEffect(() => {
    if (!purchaseId) return
    purchasesService
      .getInstallments(purchaseId)
      .then(setInstallmentsData)
      .catch(() => setInstallmentsData({ installments: [], summary: null }))
  }, [purchaseId])

  useEffect(() => {
    const investorIdFromPurchase = purchase?.investor_id ?? investorId
    if (!investorIdFromPurchase) {
      setNominees([])
      return
    }
    usersService
      .getInvestorNominees(investorIdFromPurchase)
      .then(setNominees)
      .catch(() => setNominees([]))
  }, [purchase?.investor_id, investorId])

  const installments = useMemo(() => mapInstallments(installmentsData), [installmentsData])
  const summary = installmentsData?.summary ?? null
  const investor = purchase?.investor ?? null
  const displayName = investor?.name || investor?.client_id || "Investor"
  const bankAccount = purchase?.bank_account ?? null
  const planSnapshot = purchase?.plan_snapshot ?? null
  const planDetails = planSnapshot?.investment_details ?? purchase?.plan?.investment_details ?? {}

  const handleViewDeed = async () => {
    if (purchase?.signed_deed_url) {
      window.open(purchase.signed_deed_url, "_blank", "noopener,noreferrer")
      return
    }
    setDeedLoading(true)
    try {
      const url = await purchasesService.getSignedDeedUrl(purchaseId)
      if (url) window.open(url, "_blank", "noopener,noreferrer")
      else toast.error("Deed not available")
    } catch {
      toast.error("Failed to load deed")
    } finally {
      setDeedLoading(false)
    }
  }

  const timeline = useMemo(() => {
    if (!purchase) return []
    const items = []
    if (purchase.initialized_at)
      items.push({ label: "Investment initialized", date: purchase.initialized_at, time: null })
    if (purchase.payment_proof_uploaded_at)
      items.push({ label: "Payment proof uploaded", date: purchase.payment_proof_uploaded_at, time: null })
    if (purchase.payment_verified_at)
      items.push({ label: "Payment verified", date: purchase.payment_verified_at, time: null })
    if (purchase.payment_rejected_at)
      items.push({ label: "Payment rejected", date: purchase.payment_rejected_at, time: null })
    if (purchase.leegality_signing_status === "signed")
      items.push({ label: "Deed signed", date: purchase.updated_at || purchase.created_at, time: null })
    items.push({ label: "Status: " + (purchase.status || "—"), date: purchase.updated_at || purchase.created_at, time: null })
    return items
  }, [purchase])

  if (loading && !purchase) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={investorId ? `/admin/users/investors/${investorId}` : "/admin/users/investors"} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <p className="text-muted-foreground">Investment not found.</p>
      </div>
    )
  }

  const investmentDisplayId = purchase.investment_display_id || purchase.id
  const planName = purchase.plan_name ?? purchase.plan?.name ?? planSnapshot?.name ?? "—"

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link to="/admin/users/investors" className="hover:text-foreground transition-colors">
          Investors
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <Link
          to={`/admin/users/investors/${purchase.investor_id ?? investorId}`}
          className="hover:text-foreground transition-colors truncate max-w-[180px]"
        >
          {displayName}
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-foreground truncate">{investmentDisplayId}</span>
      </nav>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-lg">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Button variant="ghost" size="sm" asChild className="-ml-2 shrink-0">
              <Link
                to={`/admin/users/investors/${purchase.investor_id ?? investorId}`}
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
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{investmentDisplayId}</h1>
                <p className="mt-0.5 text-lg font-medium text-muted-foreground">{planName}</p>
                <div className="mt-2 flex items-center gap-3">
                  <StatusBadge status={purchase.status || "active"} />
                  <span className="text-2xl font-bold tabular-nums text-foreground">{formatINR(purchase.amount)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-4 py-3 backdrop-blur-sm max-w-md">
              <Avatar className="h-10 w-10 shrink-0 rounded-lg border border-border/60">
                {investor && getProfileImageUrl(investor.profile_image) && (
                  <AvatarImage
                    src={getProfileImageUrl(investor.profile_image)}
                    alt={displayName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Investor</p>
                <Link
                  to={`/admin/users/investors/${purchase.investor_id ?? investorId}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {displayName}
                </Link>
                {investor?.client_id && (
                  <span className="ml-2 font-mono text-sm text-muted-foreground">{investor.client_id}</span>
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
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Display ID</p>
              <p className="font-mono font-medium">{investmentDisplayId}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Plan name</p>
              <p className="font-medium">{planName}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Amount</p>
              <p className="font-medium text-lg tabular-nums">{formatINR(purchase.amount)}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
              <StatusBadge status={purchase.status} />
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Initialized</p>
              <p className="text-sm">{formatDate(purchase.initialized_at || purchase.created_at)}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Payment proof uploaded</p>
              <p className="text-sm">{formatDate(purchase.payment_proof_uploaded_at)}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Payment verified</p>
              <p className="text-sm">{formatDate(purchase.payment_verified_at)}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Cheque number</p>
              <p className="text-sm">{purchase.cheque_number ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4 sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Partner</p>
              <p className="text-sm">{purchase.partner_id != null ? `Partner #${purchase.partner_id}` : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Plan snapshot */}
      {(planSnapshot || planDetails) && (
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
                <p className="font-semibold">{planSnapshot?.name ?? planName}</p>
              </div>
              {planSnapshot?.returns?.monthly_percent != null && (
                <div className="rounded-xl border border-border/60 bg-emerald-50/80 dark:bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">Monthly return</p>
                  </div>
                  <p className="text-xl font-bold tabular-nums">{planSnapshot.returns.monthly_percent}%</p>
                </div>
              )}
              {planDetails.duration_months != null && (
                <div className="rounded-xl border border-border/60 bg-blue-50/80 dark:bg-blue-950/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{planDetails.duration_months} months</p>
                </div>
              )}
              {planDetails.min_amount != null && (
                <div className="rounded-xl border border-border/60 bg-blue-50/80 dark:bg-blue-950/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Min amount</p>
                  <p className="font-semibold tabular-nums">{formatINR(planDetails.min_amount)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
          <p className="text-sm text-muted-foreground mb-4">Payouts for this investment are credited to:</p>
          {bankAccount ? (
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50/80 to-background dark:from-emerald-950/20 dark:to-background p-5 shadow-sm max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-semibold">{bankAccount.bank_name || "—"}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Account number</p>
                  <p className="font-mono font-semibold">{bankAccount.account_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">IFSC</p>
                  <p className="font-mono font-semibold">{bankAccount.ifsc || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Branch</p>
                  <p className="font-semibold">{bankAccount.bank_branch ?? bankAccount.branch ?? "—"}</p>
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
          {nominees.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {nominees.map((n) => (
                <div
                  key={n.id || n.name}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Avatar className="h-12 w-12 rounded-xl border-2 border-primary/10 bg-primary/10 text-base font-semibold text-primary">
                    <AvatarFallback>{getInitials(n.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{n.name || "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {n.relation ?? n.relationship ?? "—"}
                      {(n.share_percentage != null || n.share_percent != null) && (
                        <> · Share {n.share_percentage ?? n.share_percent}%</>
                      )}
                    </p>
                    {n.nominee_dob && (
                      <p className="mt-1 text-sm text-muted-foreground">DOB: {formatDate(n.nominee_dob)}</p>
                    )}
                    {(n.nominee_address_ocr || n.nominee_address) && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {n.nominee_address_ocr || n.nominee_address}
                      </p>
                    )}
                    {n.guardian_name && (
                      <p className="mt-1 text-sm text-muted-foreground">Guardian: {n.guardian_name}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2"
                      onClick={() => setNomineeModalNominee(n)}
                    >
                      <Eye className="h-4 w-4" />
                      View documents
                    </Button>
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

      <NomineeDocumentsModal
        isOpen={!!nomineeModalNominee}
        onClose={() => setNomineeModalNominee(null)}
        nominee={nomineeModalNominee}
        investorId={purchase?.investor_id ?? investorId}
      />

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
          {installments.length > 0 ? (
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
                    {installments.map((row, idx) => (
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
              {summary && (
                <div className="mt-5 flex flex-wrap items-center gap-6 rounded-xl border border-border/60 bg-primary/5 px-5 py-4">
                  <span className="font-semibold tabular-nums">
                    Total gross: {formatINR(summary.total_gross)}
                  </span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    Total TDS: {formatINR(summary.total_tds)}
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    Total receivable: {formatINR(summary.total_receivable)}
                  </span>
                  <span className="ml-auto rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Pending: {summary.pending_count ?? 0} · Paid: {summary.paid_count ?? 0}
                    {(summary.cancelled_count ?? 0) > 0 && ` · Cancelled: ${summary.cancelled_count}`}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
              No installments yet. Schedule generated after deed is signed.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6 & 7. Deed + Payment proof */}
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
            {purchase.signed_deed_url || purchase.leegality_signing_status === "signed" ? (
              <Button
                variant="outline"
                size="default"
                className="gap-2 shadow-sm"
                disabled={deedLoading}
                onClick={handleViewDeed}
              >
                <Eye className="h-4 w-4" />
                {deedLoading ? "Loading…" : "View deed"}
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
            {purchase.payment_proof_file_path || purchase.payment_proof_file_paths?.length > 0 ? (
              <Button
                variant="outline"
                size="default"
                className="gap-2 shadow-sm"
                onClick={() => setPaymentProofModalOpen(true)}
              >
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

      <PaymentProofModal
        isOpen={paymentProofModalOpen}
        onClose={() => setPaymentProofModalOpen(false)}
        purchase={purchase}
      />

      {/* 8. Timeline */}
      {timeline.length > 0 && (
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
            <div className="relative pl-2">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
              <ul className="space-y-0">
                {timeline.map((item, idx) => (
                  <li key={idx} className="relative flex gap-5 pb-8 last:pb-0">
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground text-xs font-semibold shadow">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-muted/10 px-4 py-3">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default InvestmentDetailPage
