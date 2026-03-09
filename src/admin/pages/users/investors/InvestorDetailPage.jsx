import React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  FileText,
  Eye,
  User,
  Building2,
  Users,
  Wallet,
  ChevronRight,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Hash,
  Calendar,
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
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  mockInvestorDetail,
  getMockInvestorById,
} from "@/lib/mockData/investors"
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

const InvestorDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const investor = getMockInvestorById(id) || {
    ...mockInvestorDetail,
    id: id || mockInvestorDetail.id,
    client_id: id || mockInvestorDetail.client_id,
  }
  const loading = false

  if (loading) {
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

  const displayName = investor.name || investor.client_id || "Investor"
  const kyc = investor.kyc || {}
  const bankAccounts = investor.bank_accounts || []
  const nominees = investor.nominees || []
  const investments = investor.investments || []

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          to="/admin/users/investors"
          className="hover:text-foreground transition-colors"
        >
          Investors
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-foreground truncate">
          {displayName}
        </span>
      </nav>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-card to-card p-6 shadow-lg">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-start gap-4">
            <Button variant="ghost" size="sm" asChild className="shrink-0 -ml-2">
              <Link to="/admin/users/investors" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Link>
            </Button>
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/20 bg-primary/10 text-primary text-2xl font-semibold">
                <AvatarFallback>{getInitials(investor.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {investor.name || "—"}
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                  {investor.client_id || "—"}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <StatusBadge status={investor.status || "active"} />
                  <StatusBadge
                    status={investor.kyc_status === "complete" ? "verified" : "pending"}
                    customLabel={investor.kyc_status === "complete" ? "KYC Complete" : "KYC Pending"}
                  />
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Nominees {investor.nominees_added ? "Added" : "Not added"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-6 grid gap-6 border-t border-border/60 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="truncate text-sm font-medium text-foreground">{investor.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mobile</p>
              <p className="text-sm font-medium text-foreground">{investor.mobile || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Referral</p>
              <p className="truncate text-sm font-medium text-foreground">
                {investor.referral || "Direct"}
                {investor.referral_code && (
                  <span className="text-muted-foreground"> ({investor.referral_code})</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">{formatDate(investor.joined || investor.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Profile & contact card */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            Profile & contact
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Name", value: investor.profile?.name || investor.name, icon: User },
              { label: "Email", value: investor.profile?.email || investor.email, icon: Mail },
              { label: "Mobile", value: investor.profile?.mobile || investor.mobile, icon: Phone },
              { label: "Client ID", value: investor.profile?.client_id || investor.client_id, icon: Hash },
              { label: "Referral", value: investor.profile?.referral || investor.referral || "Direct", icon: User },
              { label: "Created", value: formatDate(investor.profile?.created || investor.joined || investor.created_at), icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/10 p-4"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className={cn("mt-0.5 font-medium", label === "Client ID" && "font-mono text-sm")}>
                    {value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. KYC */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              KYC
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2 shadow-sm">
              <Eye className="h-4 w-4" />
              View documents
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge
              status={kyc.status === "complete" ? "verified" : "pending"}
              customLabel={kyc.status === "complete" ? "Complete" : "Pending"}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {kyc.aadhaar && (
              <div className="rounded-xl border border-border/60 bg-gradient-to-br from-amber-50/80 to-background dark:from-amber-950/20 dark:to-background p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Aadhaar</p>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-2 border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-right">{kyc.aadhaar.name || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Number</span>
                    <span className="font-mono font-medium">{kyc.aadhaar.number || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">DOB</span>
                    <span className="font-medium">{kyc.aadhaar.dob || "—"}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-1">Address</span>
                    <span className="font-medium flex items-start gap-1">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                      {kyc.aadhaar.address || "—"}
                    </span>
                  </div>
                </dl>
              </div>
            )}
            {kyc.pan && (
              <div className="rounded-xl border border-border/60 bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">PAN</p>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-2 border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{kyc.pan.name || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2 pt-2">
                    <span className="text-muted-foreground">Number</span>
                    <span className="font-mono font-semibold">{kyc.pan.number || "—"}</span>
                  </div>
                </dl>
              </div>
            )}
            {kyc.bank && (
              <div className="sm:col-span-2 rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50/80 to-background dark:from-emerald-950/20 dark:to-background p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bank (from KYC)</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account number</p>
                    <p className="font-mono font-semibold">{kyc.bank.account || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">IFSC</p>
                    <p className="font-mono font-semibold">{kyc.bank.ifsc || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bank name</p>
                    <p className="font-semibold">{kyc.bank.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Branch</p>
                    <p className="font-semibold">{kyc.bank.branch || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {kyc.documents?.length > 0 && (
            <p className="mt-5 text-xs text-muted-foreground">
              Available documents: {kyc.documents.map((d) => d.label).join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 3. Bank accounts */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            Bank accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {bankAccounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-muted-foreground">
              No bank accounts added.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Account number</TableHead>
                    <TableHead className="font-semibold">IFSC</TableHead>
                    <TableHead className="font-semibold">Bank name</TableHead>
                    <TableHead className="font-semibold">Branch</TableHead>
                    <TableHead className="font-semibold w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccounts.map((b, idx) => (
                    <TableRow
                      key={b.id || b.account_number}
                      className={cn(idx % 2 === 0 ? "bg-background" : "bg-muted/20")}
                    >
                      <TableCell className="font-mono font-medium">{b.account_number || "—"}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{b.ifsc || "—"}</TableCell>
                      <TableCell className="font-medium">{b.bank_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{b.branch || "—"}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={b.status === "active" ? "active" : "inactive"}
                          customLabel={b.status === "active" ? "Active" : "Inactive"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            Nominees
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {nominees.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-muted-foreground">
              No nominees added.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {nominees.map((n) => (
                <div
                  key={n.id || n.name}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Avatar className="h-14 w-14 rounded-xl border-2 border-primary/10 bg-primary/10 text-lg font-semibold text-primary">
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
          )}
        </CardContent>
      </Card>

      {/* 5. Investments */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            Investments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {investments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-muted-foreground">
              No investments yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Investment ID</TableHead>
                    <TableHead className="font-semibold">Plan name</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Initialized at</TableHead>
                    <TableHead className="font-semibold">Payment verified at</TableHead>
                    <TableHead className="text-right font-semibold w-44">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((inv, idx) => (
                    <TableRow
                      key={inv.id || inv.investment_id}
                      className={cn(
                        idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                        "transition-colors hover:bg-muted/30"
                      )}
                    >
                      <TableCell className="font-mono text-sm font-medium">{inv.investment_id || "—"}</TableCell>
                      <TableCell className="font-medium">{inv.plan_name || "—"}</TableCell>
                      <TableCell className="tabular-nums font-semibold">{formatINR(inv.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status || "active"} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(inv.initialized_at)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(inv.payment_verified_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.has_deed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => {}}
                            >
                              <FileText className="h-4 w-4" />
                              View deed
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1.5"
                            onClick={() =>
                              navigate(
                                `/admin/users/investors/${investor.id}/investments/${inv.id || inv.investment_id}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InvestorDetailPage
