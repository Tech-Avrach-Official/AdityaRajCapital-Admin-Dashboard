import React, { useState, useEffect, useMemo } from "react"
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"
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
import { toast } from "react-hot-toast"
import StatusBadge from "@/components/common/StatusBadge"
import { Badge } from "@/components/ui/badge"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersService } from "@/modules/admin/api/services/usersService"
import { purchasesService } from "@/modules/admin/api/services/purchasesService"
import NomineeDocumentsModal from "./components/NomineeDocumentsModal"
import KYCDocumentsModal from "./components/KYCDocumentsModal"
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

/** Map API kyc-data response to UI shape (aadhaar, pan, bank, status) */
function mapKycToUi(kycData) {
  const raw = kycData?.kyc
  if (!raw) return { status: "pending", aadhaar: null, pan: null, bank: null, documents: kycData?.documents ?? [] }
  return {
    status: raw.kyc_verified ? "verified" : "pending",
    aadhaar: raw.aadhar_name || raw.aadhar_number
      ? {
          name: raw.aadhar_name,
          number: raw.aadhar_number,
          dob: raw.aadhar_dob,
          address: [raw.aadhar_address, raw.aadhar_city, raw.aadhar_district, raw.aadhar_state, raw.aadhar_pin_code]
            .filter(Boolean)
            .join(", ") || undefined,
        }
      : null,
    pan: raw.pan_name || raw.pan_number ? { name: raw.pan_name, number: raw.pan_number } : null,
    bank:
      raw.bank_account_number || raw.bank_ifsc
        ? {
            account: raw.bank_account_number,
            ifsc: raw.bank_ifsc,
            name: raw.bank_name,
            branch: raw.bank_branch,
          }
        : null,
    documents: kycData?.documents ?? [],
  }
}

const InvestorDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [investor, setInvestor] = useState(location.state?.investor ?? null)
  const [kycData, setKycData] = useState(null)
  const [bankAccounts, setBankAccounts] = useState([])
  const [nominees, setNominees] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [deedLoadingId, setDeedLoadingId] = useState(null)
  const [nomineeModalNominee, setNomineeModalNominee] = useState(null)
  const [kycDocumentsModalOpen, setKycDocumentsModalOpen] = useState(false)

  const investorId = id != null && id !== "" ? id : null

  useEffect(() => {
    if (!investorId) {
      setLoading(false)
      return
    }
    if (location.state?.investor) {
      setInvestor(location.state.investor)
      setLoading(false)
      return
    }
    setLoading(true)
    usersService
      .getInvestor(investorId)
      .then((data) => setInvestor(data ?? null))
      .catch(() => {
        toast.error("Failed to load investor")
        setInvestor(null)
      })
      .finally(() => setLoading(false))
  }, [investorId, location.state?.investor])

  useEffect(() => {
    if (!investorId) {
      setLoadingDetail(false)
      return
    }
    setLoadingDetail(true)
    Promise.all([
      usersService.getInvestorKycData(investorId).catch(() => null),
      usersService.getInvestorBankAccounts(investorId).catch(() => []),
      usersService.getInvestorNominees(investorId).catch(() => []),
      usersService.getInvestorPurchases(investorId).catch(() => ({ purchases: [], total: 0 })),
    ])
      .then(([kyc, banks, noms, pur]) => {
        setKycData(kyc)
        setBankAccounts(Array.isArray(banks) ? banks : [])
        setNominees(Array.isArray(noms) ? noms : [])
        setPurchases(pur?.purchases ?? [])
      })
      .finally(() => setLoadingDetail(false))
  }, [investorId])

  const kyc = useMemo(() => mapKycToUi(kycData), [kycData])
  const displayName = investor?.name || investor?.client_id || "Investor"
  const nomineesAdded = investor?.nominees_added ?? investor?.has_nominees === 1

  const handleViewDeed = async (purchaseId) => {
    setDeedLoadingId(purchaseId)
    try {
      const url = await purchasesService.getSignedDeedUrl(purchaseId)
      if (url) window.open(url, "_blank", "noopener,noreferrer")
      else toast.error("Deed not available")
    } catch {
      toast.error("Failed to load deed")
    } finally {
      setDeedLoadingId(null)
    }
  }

  if (loading && !investor) {
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

  if (!investor && !loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users/investors" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Link>
        </Button>
        <p className="text-muted-foreground">Investor not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/users/investors" className="hover:text-foreground transition-colors">
          Investors
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-foreground truncate">{displayName}</span>
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
                {getProfileImageUrl(investor.profile_image) && (
                  <AvatarImage
                    src={getProfileImageUrl(investor.profile_image)}
                    alt={investor.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback>{getInitials(investor.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{investor.name || "—"}</h1>
                <p className="font-mono text-sm text-muted-foreground">{investor.client_id || "—"}</p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <StatusBadge status={investor.status || "active"} />
                  <StatusBadge
                    status={
                      investor.kyc_status === "verified" ||
                      investor.kyc_status === "complete" ||
                      investor.kyc_complete === 1
                        ? "verified"
                        : "pending"
                    }
                    customLabel={
                      investor.kyc_status === "verified" ||
                      investor.kyc_status === "complete" ||
                      investor.kyc_complete === 1
                        ? "KYC Verified"
                        : "KYC Pending"
                    }
                  />
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Nominees {nomineesAdded ? "Added" : "Not added"}
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
              <Calendar className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">{formatDate(investor.joined || investor.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment summary, Branch, Referral (Partner/RM) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Investment summary */}
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              Investment summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-muted-foreground">Total invested</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {formatINR(
                    investor.purchase_summary?.total_invested_amount ??
                      investor.investment?.total_invested_amount ??
                      investor.investment?.total_investment_amount
                  )}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-muted-foreground">Verified count</span>
                <span className="font-medium tabular-nums">
                  {investor.purchase_summary?.total_verified_count ?? investor.investment?.total_verified_count ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-muted-foreground">Last verified</span>
                <span className="font-medium text-muted-foreground">
                  {formatDate(
                    investor.purchase_summary?.last_verified_at ?? investor.investment?.last_verified_at
                  )}
                </span>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Branch */}
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              Branch
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {investor.branch ? (
              <dl className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Name</span>
                  <p className="font-medium">{investor.branch.name || "—"}</p>
                </div>
                {investor.branch.state_name && (
                  <div>
                    <span className="text-muted-foreground block mb-1">State</span>
                    <p className="font-medium">{investor.branch.state_name}</p>
                  </div>
                )}
                {investor.branch.nation_name && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Nation</span>
                    <p className="font-medium">{investor.branch.nation_name}</p>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No branch assigned.</p>
            )}
          </CardContent>
        </Card>

        {/* Referral – Partner or RM */}
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              Referred by
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {investor.partner ? (
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Partner</Badge>
                  <span className="font-medium">{investor.partner.name ?? investor.partner.partner_name ?? "—"}</span>
                </div>
                <dl className="space-y-2">
                  {(investor.partner.email || investor.partner.mobile) && (
                    <>
                      {investor.partner.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{investor.partner.email}</span>
                        </div>
                      )}
                      {(investor.partner.mobile || investor.partner.phone_number) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{investor.partner.mobile ?? investor.partner.phone_number}</span>
                        </div>
                      )}
                    </>
                  )}
                  {investor.partner.partner_referral_code && (
                    <div className="pt-2 border-t border-border/40">
                      <span className="text-muted-foreground">Referral code </span>
                      <span className="font-mono font-medium">{investor.partner.partner_referral_code}</span>
                    </div>
                  )}
                </dl>
              </div>
            ) : investor.rm ? (
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">RM</Badge>
                  <span className="font-medium">{investor.rm.name ?? investor.rm.rm_code ?? "—"}</span>
                </div>
                <dl className="space-y-2">
                  {(investor.rm.email || investor.rm.phone_number) && (
                    <>
                      {investor.rm.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{investor.rm.email}</span>
                        </div>
                      )}
                      {investor.rm.phone_number && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{investor.rm.phone_number}</span>
                        </div>
                      )}
                    </>
                  )}
                  {investor.rm.rm_code && (
                    <div className="pt-2 border-t border-border/40">
                      <span className="text-muted-foreground">RM code </span>
                      <span className="font-mono font-medium">{investor.rm.rm_code}</span>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Direct (no partner or RM).</p>
            )}
          </CardContent>
        </Card>
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
              { label: "Name", value: investor.name, icon: User },
              { label: "Email", value: investor.email, icon: Mail },
              { label: "Mobile", value: investor.mobile, icon: Phone },
              { label: "Client ID", value: investor.client_id, icon: Hash },
              { label: "Referral", value: investor.referral || "Direct", icon: User },
              { label: "Created", value: formatDate(investor.joined || investor.created_at), icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/10 p-4">
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
      {loadingDetail ? (
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2.5 text-lg">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                KYC
              </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shadow-sm"
              onClick={() => setKycDocumentsModalOpen(true)}
            >
              <Eye className="h-4 w-4" />
              View documents
            </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge
                status={kyc.status === "verified" || kyc.status === "complete" ? "verified" : "pending"}
                customLabel={kyc.status === "verified" || kyc.status === "complete" ? "Verified" : "Pending"}
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
                Available documents: {kyc.documents.map((d) => d.document_type || d.label || "Document").join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
          {loadingDetail ? (
            <Skeleton className="h-24 w-full" />
          ) : bankAccounts.length === 0 ? (
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
                    <TableRow key={b.id || b.account_number} className={cn(idx % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                      <TableCell className="font-mono font-medium">{b.account_number || "—"}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{b.ifsc || "—"}</TableCell>
                      <TableCell className="font-medium">{b.bank_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{b.bank_branch ?? b.branch ?? "—"}</TableCell>
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
          {loadingDetail ? (
            <Skeleton className="h-24 w-full" />
          ) : nominees.length === 0 ? (
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
                      {n.relation ?? n.relationship ?? "—"}
                      {(n.share_percentage != null || n.share_percent != null) && (
                        <> · Share {n.share_percentage ?? n.share_percent}%</>
                      )}
                    </p>
                    {n.nominee_dob && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        DOB: {formatDate(n.nominee_dob)}
                      </p>
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
          )}
        </CardContent>
      </Card>

      <KYCDocumentsModal
        isOpen={kycDocumentsModalOpen}
        onClose={() => setKycDocumentsModalOpen(false)}
        investorId={investorId}
        investorName={displayName}
      />

      <NomineeDocumentsModal
        isOpen={!!nomineeModalNominee}
        onClose={() => setNomineeModalNominee(null)}
        nominee={nomineeModalNominee}
        investorId={investorId}
      />

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
          {loadingDetail ? (
            <Skeleton className="h-24 w-full" />
          ) : purchases.length === 0 ? (
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
                  {purchases.map((inv, idx) => (
                    <TableRow
                      key={inv.id}
                      className={cn(
                        idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                        "transition-colors hover:bg-muted/30"
                      )}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {inv.investment_display_id || inv.id || "—"}
                      </TableCell>
                      <TableCell className="font-medium">{inv.plan_name || "—"}</TableCell>
                      <TableCell className="tabular-nums font-semibold">{formatINR(inv.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status || "active"} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(inv.initialized_at || inv.created_at)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(inv.payment_verified_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.has_deed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              disabled={deedLoadingId === inv.id}
                              onClick={() => handleViewDeed(inv.id)}
                            >
                              <FileText className="h-4 w-4" />
                              {deedLoadingId === inv.id ? "Loading…" : "View deed"}
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1.5"
                            onClick={() =>
                              navigate(`/admin/users/investors/${investor.id}/investments/${inv.id}`)
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
