import React, { useState, useEffect, useMemo } from "react"
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
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
  UserCog,
  ExternalLink,
  X,
  IndianRupee,
  Target,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ImageViewerModal from "@/components/common/ImageViewerModal"
import ChangeRMModal from "./components/ChangeRMModal"
import { usersService } from "@/modules/admin/api/services/usersService"
import { cn, getProfileImageUrl } from "@/lib/utils"

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—"

const formatDateOnly = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" })
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

const isPdfUrl = (url, docType) => {
  if (!url) return false
  const u = (url || "").toLowerCase()
  const t = (docType || "").toLowerCase()
  return u.includes(".pdf") || u.includes("application/pdf") || t.includes("pdf")
}

/** Map API partner KYC to UI shape (aadhaar, pan, bank) for consistent card styling */
function mapPartnerKycToUi(kyc) {
  if (!kyc) return { status: "pending", aadhaar: null, pan: null, bank: null }
  return {
    status: kyc.kyc_verified ? "verified" : "pending",
    aadhaar:
      kyc.aadhar_name || kyc.aadhar_number
        ? {
            name: kyc.aadhar_name,
            number: kyc.aadhar_number,
            dob: kyc.aadhar_dob,
            address: [kyc.aadhar_address, kyc.aadhar_city, kyc.aadhar_district, kyc.aadhar_state, kyc.aadhar_pin_code]
              .filter(Boolean)
              .join(", ") || undefined,
          }
        : null,
    pan: kyc.pan_name || kyc.pan_number ? { name: kyc.pan_name, number: kyc.pan_number } : null,
    bank:
      kyc.bank_account_number || kyc.bank_ifsc
        ? {
            account: kyc.bank_account_number,
            ifsc: kyc.bank_ifsc,
            name: kyc.bank_name,
            branch: kyc.bank_branch,
          }
        : null,
  }
}

const DOCUMENT_TYPE_LABELS = {
  aadhar_front: "Aadhaar (Front)",
  aadhar_back: "Aadhaar (Back)",
  pan_card: "PAN Card",
  cancelled_cheque: "Cancelled Cheque",
  nominee_aadhar_front: "Nominee Aadhaar (Front)",
  nominee_aadhar_back: "Nominee Aadhaar (Back)",
}

const PartnerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [imagePreview, setImagePreview] = useState({ open: false, url: null, title: null })
  const [changeRMModalOpen, setChangeRMModalOpen] = useState(false)

  const partnerId = id != null && id !== "" ? id : null

  useEffect(() => {
    if (!partnerId) {
      setLoading(false)
      return
    }
    setLoading(true)
    usersService
      .getPartner(partnerId)
      .then((data) => setDetail(data ?? null))
      .catch(() => {
        toast.error("Failed to load partner")
        setDetail(null)
      })
      .finally(() => setLoading(false))
  }, [partnerId])

  const handleRMChangeSuccess = () => {
    setChangeRMModalOpen(false)
    toast.success("Partner RM changed successfully")
    usersService.getPartner(partnerId).then(setDetail)
  }

  const p = detail?.partner ?? location.state?.partner ?? null
  const kycUi = useMemo(() => mapPartnerKycToUi(detail?.kyc), [detail?.kyc])
  const displayName = p?.name || p?.partner_referral_code || p?.referral_code || "Partner"

  if (loading && !p) {
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

  if (!p && !loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users/partners" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Partners
          </Link>
        </Button>
        <p className="text-muted-foreground">Partner not found.</p>
      </div>
    )
  }

  const rm = detail?.rm ?? p?.rm ?? null
  const branch = detail?.branch ?? p?.branch ?? null
  const kyc = detail?.kyc ?? null
  const documents = detail?.kyc_documents ?? detail?.documents ?? []
  const nominee = detail?.nominee ?? null
  const nomineeDocuments = detail?.nominee_documents ?? []
  const referralSummary = detail?.referral_summary ?? p?.referral_summary ?? null
  const referredInvestors = detail?.referred_investors ?? []
  const commissionSummary = detail?.commission_summary ?? null
  const commissionDistribution = detail?.commission_distribution ?? []
  const goals = detail?.goals ?? []
  const deed = detail?.deed ?? null

  const formatGoalValue = (val, goalType) => {
    if (val == null) return "—"
    if (goalType === "commission" || goalType === "amount") return formatINR(val)
    return String(val)
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/users/partners" className="hover:text-foreground transition-colors">
          Partners
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-foreground truncate">{displayName}</span>
      </nav>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-card to-card p-6 shadow-lg">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-start gap-4">
            <Button variant="ghost" size="sm" asChild className="shrink-0 -ml-2">
              <Link to="/admin/users/partners" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Link>
            </Button>
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/20 bg-primary/10 text-primary text-2xl font-semibold">
                {getProfileImageUrl(p.profile_image) && (
                  <AvatarImage
                    src={getProfileImageUrl(p.profile_image)}
                    alt={p.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{p.name || "—"}</h1>
                <p className="font-mono text-sm text-muted-foreground">
                  {p.partner_referral_code ?? p.referral_code ?? "—"}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <StatusBadge status={p.status || "active"} />
                  <StatusBadge
                    status={p.kyc_status || (kycUi.status === "verified" || kycUi.status === "complete" ? "verified" : "pending")}
                    customLabel={
                      p.kyc_status
                        ? String(p.kyc_status).charAt(0).toUpperCase() + String(p.kyc_status).slice(1)
                        : kycUi.status === "verified" || kycUi.status === "complete"
                          ? "KYC Verified"
                          : "KYC Pending"
                    }
                  />
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Signup {p.signup_status ?? "—"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shadow-sm"
                    onClick={() => setChangeRMModalOpen(true)}
                  >
                    <UserCog className="h-4 w-4" />
                    Change RM
                  </Button>
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
              <p className="truncate text-sm font-medium text-foreground">{p.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mobile</p>
              <p className="text-sm font-medium text-foreground">{p.mobile || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">{formatDate(p.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Branch</p>
              <p className="truncate text-sm font-medium text-foreground">{branch?.name ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards: Referral summary, Branch, RM */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              Referral summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {referralSummary ? (
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-muted-foreground">Referred investors</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {referralSummary.referred_investors_count ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-muted-foreground">Total invested by referred</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatINR(referralSummary.total_invested_by_referred)}
                  </span>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No referral data.</p>
            )}
          </CardContent>
        </Card>

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
            {branch ? (
              <dl className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Name</span>
                  <p className="font-medium">{branch.name || "—"}</p>
                </div>
                {branch.state_name && (
                  <div>
                    <span className="text-muted-foreground block mb-1">State</span>
                    <p className="font-medium">{branch.state_name}</p>
                  </div>
                )}
                {branch.nation_name && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Nation</span>
                    <p className="font-medium">{branch.nation_name}</p>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No branch assigned.</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              Assigned RM
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {rm ? (
              <div className="space-y-4 text-sm">
                <p className="font-medium">{rm.rm_name ?? "—"}</p>
                <p className="font-mono text-muted-foreground">{rm.rm_code ?? "—"}</p>
                <StatusBadge status={rm.rm_status ?? "active"} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No RM assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile & contact */}
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
              { label: "Name", value: p.name, icon: User },
              { label: "Email", value: p.email, icon: Mail },
              { label: "Mobile", value: p.mobile, icon: Phone },
              { label: "Referral code", value: p.partner_referral_code ?? p.referral_code, icon: Hash },
              { label: "Signup status", value: p.signup_status, icon: User },
              { label: "Created", value: formatDate(p.created_at), icon: Calendar },
              { label: "Email verified", value: p.email_verified_at ? formatDate(p.email_verified_at) : "—", icon: Mail },
              { label: "Mobile verified", value: p.mobile_verified_at ? formatDate(p.mobile_verified_at) : "—", icon: Phone },
              { label: "Updated", value: formatDate(p.updated_at), icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/10 p-4">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className={cn("mt-0.5 font-medium", label === "Referral code" && "font-mono text-sm")}>
                    {value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commission summary */}
      {commissionSummary && (
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IndianRupee className="h-5 w-5" />
              </div>
              Commission summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
                <p className="text-xs font-medium text-muted-foreground">Total earned</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{formatINR(commissionSummary.total_earned)}</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
                <p className="text-xs font-medium text-muted-foreground">Total paid</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-green-600 dark:text-green-400">
                  {formatINR(commissionSummary.total_paid)}
                </p>
              </div>
              <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
                <p className="text-xs font-medium text-muted-foreground">Total pending</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {formatINR(commissionSummary.total_pending)}
                </p>
              </div>
              <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
                <p className="text-xs font-medium text-muted-foreground">TDS %</p>
                <p className="mt-1 text-lg font-semibold">{commissionSummary.tds_percent ?? "—"}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KYC */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            KYC
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge
              status={p.kyc_status || (kycUi.status === "verified" || kycUi.status === "complete" ? "verified" : "pending")}
              customLabel={
                p.kyc_status
                  ? String(p.kyc_status).charAt(0).toUpperCase() + String(p.kyc_status).slice(1)
                  : kycUi.status === "verified" || kycUi.status === "complete"
                    ? "Verified"
                    : "Pending"
              }
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {kycUi.aadhaar && (
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
                    <span className="font-medium text-right">{kycUi.aadhaar.name || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Number</span>
                    <span className="font-mono font-medium">{kycUi.aadhaar.number || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">DOB</span>
                    <span className="font-medium">{formatDateOnly(kycUi.aadhaar.dob)}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-1">Address</span>
                    <span className="font-medium flex items-start gap-1">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                      {kycUi.aadhaar.address || "—"}
                    </span>
                  </div>
                </dl>
              </div>
            )}
            {kycUi.pan && (
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
                    <span className="font-medium">{kycUi.pan.name || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2 pt-2">
                    <span className="text-muted-foreground">Number</span>
                    <span className="font-mono font-semibold">{kycUi.pan.number || "—"}</span>
                  </div>
                </dl>
              </div>
            )}
            {kycUi.bank && (
              <div className="sm:col-span-2 rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50/80 to-background dark:from-emerald-950/20 dark:to-background p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bank</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account number</p>
                    <p className="font-mono font-semibold">{kycUi.bank.account || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">IFSC</p>
                    <p className="font-mono font-semibold">{kycUi.bank.ifsc || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bank name</p>
                    <p className="font-semibold">{kycUi.bank.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Branch</p>
                    <p className="font-semibold">{kycUi.bank.branch || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {documents.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">KYC Documents</p>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc, idx) => {
                  const label = DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type ?? "Document"
                  const isPdf = isPdfUrl(doc.url, doc.document_type)
                  return (
                    <div key={idx} className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/10 px-3 py-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium min-w-[120px]">{label}</span>
                      {doc.url && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => {
                              if (isPdf) setPreviewDoc({ url: doc.url, title: label })
                              else setImagePreview({ open: true, url: doc.url, title: label })
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-primary gap-1" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              Open <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nominee */}
      {(nominee || nomineeDocuments.length > 0) && (
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              Nominee
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {nominee ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {[
                  { label: "Name", value: nominee.nominee_name },
                  { label: "Relation", value: nominee.nominee_relation },
                  { label: "DOB", value: formatDateOnly(nominee.nominee_dob) },
                  { label: "Aadhaar", value: nominee.nominee_aadhar_number },
                  { label: "Address", value: nominee.nominee_address },
                  { label: "City", value: nominee.nominee_city },
                  { label: "State", value: nominee.nominee_state },
                  { label: "PIN", value: nominee.nominee_pin_code },
                ]
                  .filter((f) => f.value != null && f.value !== "")
                  .map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/10 p-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">{label}</p>
                        <p className="mt-0.5 font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : null}
            {nomineeDocuments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Nominee documents</p>
                <div className="flex flex-wrap gap-2">
                  {nomineeDocuments.map((doc, idx) => {
                    const label = DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type ?? "Document"
                    const isPdf = isPdfUrl(doc.url, doc.document_type)
                    return (
                      <div key={idx} className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/10 px-3 py-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{label}</span>
                        {doc.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              if (isPdf) setPreviewDoc({ url: doc.url, title: label })
                              else setImagePreview({ open: true, url: doc.url, title: label })
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deed */}
      {deed?.signed_deed_url && (
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              Partner deed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge
                status={deed.leegality_signing_status === "completed" ? "verified" : "pending"}
                customLabel={deed.leegality_signing_status === "completed" ? "Signed" : deed.leegality_signing_status ?? "—"}
              />
              <Button variant="default" size="sm" className="gap-2" asChild>
                <a href={deed.signed_deed_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                  View signed deed
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referred investors */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            Referred investors ({referredInvestors.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {referredInvestors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-muted-foreground">
              No referred investors yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Client ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold w-24">KYC</TableHead>
                    <TableHead className="font-semibold">Verified</TableHead>
                    <TableHead className="font-semibold">Total invested</TableHead>
                    <TableHead className="text-right font-semibold w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referredInvestors.map((inv, idx) => (
                    <TableRow
                      key={inv.id}
                      className={cn(
                        idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                        "transition-colors hover:bg-muted/30"
                      )}
                    >
                      <TableCell className="font-mono text-sm font-medium">{inv.client_id ?? "—"}</TableCell>
                      <TableCell className="font-medium">{inv.name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.email ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={inv.kyc_complete === 1 ? "verified" : "pending"} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {inv.purchase_summary?.total_verified_count ?? 0}
                      </TableCell>
                      <TableCell className="tabular-nums font-medium">
                        {formatINR(inv.purchase_summary?.total_invested_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => navigate(`/admin/users/investors/${inv.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission distribution */}
      {commissionDistribution.length > 0 && (
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IndianRupee className="h-5 w-5" />
              </div>
              Commission distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Investment ID</TableHead>
                    <TableHead className="font-semibold">Period</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Receivable</TableHead>
                    <TableHead className="font-semibold">TDS</TableHead>
                    <TableHead className="font-semibold w-24">Status</TableHead>
                    <TableHead className="font-semibold">Paid at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionDistribution.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                        "transition-colors hover:bg-muted/30"
                      )}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {row.investment_display_id ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {row.due_window_label ?? "—"}
                      </TableCell>
                      <TableCell className="tabular-nums font-medium">{formatINR(row.amount)}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {formatINR(row.amount_receivable)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {row.tds_percent != null ? `${row.tds_percent}%` : "—"} ({formatINR(row.tds_amount)})
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {row.paid_at ? formatDate(row.paid_at) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-5">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              Goals ({detail?.goals_total ?? goals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Period</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Target</TableHead>
                    <TableHead className="font-semibold">Achieved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.map((g, idx) => (
                    <TableRow
                      key={g.id}
                      className={cn(
                        idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                        "transition-colors hover:bg-muted/30"
                      )}
                    >
                      <TableCell className="font-medium">{g.period ?? "—"}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{g.goal_type ?? "—"}</TableCell>
                      <TableCell className="tabular-nums font-medium">
                        {formatGoalValue(g.target, g.goal_type)}
                      </TableCell>
                      <TableCell className="tabular-nums font-semibold">
                        {formatGoalValue(g.achieved, g.goal_type)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF preview dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b flex-shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="text-base truncate pr-4">{previewDoc?.title ?? "Document"}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)} title="Close">
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-muted/30 flex items-center justify-center p-4">
            {previewDoc?.url && (
              <iframe
                src={previewDoc.url}
                title={previewDoc.title}
                className="w-full h-full min-h-[70vh] rounded border bg-white"
              />
            )}
          </div>
          <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground text-center flex-shrink-0">
            <a
              href={previewDoc?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Open in new tab <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <ImageViewerModal
        isOpen={imagePreview.open}
        onClose={() => setImagePreview((prev) => ({ ...prev, open: false }))}
        imageUrl={imagePreview.url}
        title={imagePreview.title}
      />

      <ChangeRMModal
        isOpen={changeRMModalOpen}
        onClose={() => setChangeRMModalOpen(false)}
        partner={detail?.partner ?? p}
        onSuccess={handleRMChangeSuccess}
      />
    </div>
  )
}

export default PartnerDetailPage
