import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import {
  ArrowLeft,
  User,
  Building2,
  Users,
  Wallet,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  FileText,
  Edit,
  Trash2,
  Eye,
  Briefcase,
  TrendingUp,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usersService } from "@/modules/admin/api/services/usersService"
import { cn, getProfileImageUrl } from "@/lib/utils"
import EditRMModal from "./components/EditRMModal"
import DeleteConfirmationModal from "./components/DeleteConfirmationModal"
import ImageViewerModal from "@/components/common/ImageViewerModal"

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

const RMDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState({ open: false, url: null, title: null })

  const rmId = id != null && id !== "" ? id : null

  const loadDetail = () => {
    if (!rmId) return
    setLoading(true)
    usersService
      .getRM(rmId)
      .then((res) => {
        // API returns { rm, branch, commission_summary, partners, investors, visits, ... }
        if (res?.rm) setData(res)
        else if (res?.data?.rm) setData(res.data)
        else setData(res)
      })
      .catch(() => {
        toast.error("Failed to load RM details")
        setData(null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!rmId) {
      setLoading(false)
      return
    }
    loadDetail()
  }, [rmId])

  const handleEditSuccess = () => {
    setEditModalOpen(false)
    toast.success("RM updated successfully")
    loadDetail()
  }

  const handleDeleteSuccess = () => {
    setDeleteModalOpen(false)
    navigate("/admin/users/rms")
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const rm = data?.rm ?? null
  if (!rm && !loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users/rms" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to RMs
          </Link>
        </Button>
        <p className="text-muted-foreground">RM not found.</p>
      </div>
    )
  }

  const branch = data?.branch ?? null
  const commissionSummary = data?.commission_summary ?? null
  const partners = data?.partners ?? []
  const partnerCount = data?.partner_count ?? partners.length ?? 0
  const investors = data?.investors ?? []
  const investorCount = data?.investor_count ?? investors.length ?? 0
  const visits = data?.visits ?? []
  const visitsCount = data?.visits_count ?? visits.length ?? 0
  const commissionDistribution = data?.commission_distribution ?? []
  const commissionDistributionCount = data?.commission_distribution_count ?? commissionDistribution.length ?? 0

  const profileImage = rm.profile_image || rm.profile_image_url

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/users/rms" className="hover:text-foreground transition-colors">
          RMs
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{rm.name || rm.rm_code || "RM"}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users/rms" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to RMs
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditModalOpen(true)}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Hero */}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="bg-muted/30 p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 rounded-xl border-4 border-background shadow-md">
              {profileImage && <AvatarImage src={getProfileImageUrl(profileImage)} alt={rm.name} />}
              <AvatarFallback className="rounded-xl text-2xl bg-primary/10 text-primary">
                {getInitials(rm.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">{rm.name}</h1>
              <p className="font-mono text-sm text-muted-foreground mt-0.5">{rm.rm_code}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <StatusBadge status={rm.status === "active" ? "active" : "inactive"} />
                {branch && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {branch.name}
                    {branch.state_name && (
                      <span className="text-muted-foreground/80"> · {branch.state_name}</span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <a href={`mailto:${rm.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <Mail className="h-4 w-4" />
                  {rm.email}
                </a>
                {rm.phone_number && (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {rm.phone_number}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Partners</p>
                <p className="text-2xl font-bold tabular-nums">{partnerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Direct Investors</p>
                <p className="text-2xl font-bold tabular-nums">{investorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visits</p>
                <p className="text-2xl font-bold tabular-nums">{visitsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receivable Commission</p>
                <p className="text-xl font-bold tabular-nums">
                  {commissionSummary?.receivable_commission != null
                    ? formatINR(commissionSummary.receivable_commission)
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Profile & docs, Partners, Investors, Visits, Commission */}
      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="partners" className="gap-2">
            <Users className="h-4 w-4" />
            Partners ({partnerCount})
          </TabsTrigger>
          <TabsTrigger value="investors" className="gap-2">
            <User className="h-4 w-4" />
            Investors ({investorCount})
          </TabsTrigger>
          <TabsTrigger value="visits" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Visits ({visitsCount})
          </TabsTrigger>
          <TabsTrigger value="commission" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Commission
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <FileText className="h-4 w-4" />
            Profile & docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Partners under this RM</CardTitle>
              <p className="text-sm text-muted-foreground">
                Partners with referral and commission summary.
              </p>
            </CardHeader>
            <CardContent>
              {partners.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No partners assigned.</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Referred investors</TableHead>
                        <TableHead>Total invested (referred)</TableHead>
                        <TableHead>Commission earned</TableHead>
                        <TableHead>RM commission from them</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Link
                              to={`/admin/users/partners/${p.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {p.name}
                            </Link>
                            {p.email && (
                              <p className="text-xs text-muted-foreground">{p.email}</p>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {p.partner_referral_code || p.referral_code || "—"}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {p.referral_summary?.referred_investors_count ?? "—"}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {p.referral_summary?.total_invested_by_referred != null
                              ? formatINR(p.referral_summary.total_invested_by_referred)
                              : "—"}
                          </TableCell>
                          <TableCell className="tabular-nums font-medium">
                            {p.commission_earned != null ? formatINR(p.commission_earned) : "—"}
                          </TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {p.rm_commission_earned_from_their_investors != null
                              ? formatINR(p.rm_commission_earned_from_their_investors)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateOnly(p.created_at)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/users/partners/${p.id}`} className="gap-1">
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
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
        </TabsContent>

        <TabsContent value="investors" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Direct investors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Investors linked directly to this RM (no partner).
              </p>
            </CardHeader>
            <CardContent>
              {investors.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No direct investors.</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investor</TableHead>
                        <TableHead>Client ID</TableHead>
                        <TableHead>Verified count</TableHead>
                        <TableHead>Total invested</TableHead>
                        <TableHead>Last verified</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investors.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell>
                            <Link
                              to={`/admin/users/investors/${inv.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {inv.name}
                            </Link>
                            {inv.email && (
                              <p className="text-xs text-muted-foreground">{inv.email}</p>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{(inv.client_id || inv.client_number) ?? "—"}</TableCell>
                          <TableCell className="tabular-nums">
                            {inv.purchase_summary?.total_verified_count ?? "—"}
                          </TableCell>
                          <TableCell className="tabular-nums font-medium">
                            {inv.purchase_summary?.total_invested_amount != null
                              ? formatINR(inv.purchase_summary.total_invested_amount)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {inv.purchase_summary?.last_verified_at
                              ? formatDateOnly(inv.purchase_summary.last_verified_at)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/users/investors/${inv.id}`} className="gap-1">
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
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
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Visits (meetings)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Partner and investor visits logged by this RM.
              </p>
            </CardHeader>
            <CardContent>
              {visits.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No visits recorded.</p>
              ) : (
                <div className="space-y-3">
                  {visits.map((v) => (
                    <Card key={v.id} className="border-border/60">
                      <CardContent className="py-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <StatusBadge
                                status={v.visit_type === "partner" ? "active" : "default"}
                                customLabel={v.visit_type === "partner" ? "Partner" : "Investor"}
                              />
                              {v.is_existing != null && (
                                <span className="text-xs text-muted-foreground">
                                  {v.is_existing ? "Existing" : "New"}
                                </span>
                              )}
                            </div>
                            {v.description && (
                              <p className="text-sm mt-2 text-muted-foreground">{v.description}</p>
                            )}
                            {(v.contact_name || v.contact_number) && (
                              <p className="text-xs mt-1 text-muted-foreground">
                                {v.contact_name}
                                {v.contact_number && ` · ${v.contact_number}`}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(v.created_at)}
                          </span>
                        </div>
                        {v.image_urls?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Proof images (click to enlarge)</p>
                            <div className="flex flex-wrap gap-2">
                              {v.image_urls.slice(0, 4).map((url, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() =>
                                    setImagePreview({
                                      open: true,
                                      url,
                                      title: `Visit proof ${i + 1} · ${formatDate(v.created_at)}`,
                                    })
                                  }
                                  className="rounded-lg border border-border overflow-hidden bg-muted hover:opacity-90 hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shrink-0"
                                >
                                  <img
                                    src={url}
                                    alt={`Visit proof ${i + 1}`}
                                    className="h-20 w-20 sm:h-24 sm:w-24 object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E"
                                      e.target.className = "h-20 w-20 sm:h-24 sm:w-24 object-contain bg-muted/50 p-2"
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Commission summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total commission</span>
                  <span className="font-medium tabular-nums">
                    {commissionSummary?.total_commission != null
                      ? formatINR(commissionSummary.total_commission)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium tabular-nums text-emerald-600">
                    {commissionSummary?.paid_commission != null
                      ? formatINR(commissionSummary.paid_commission)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium tabular-nums">
                    {commissionSummary?.pending_commission != null
                      ? formatINR(commissionSummary.pending_commission)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-medium">Receivable (after TDS)</span>
                  <span className="font-bold tabular-nums">
                    {commissionSummary?.receivable_commission != null
                      ? formatINR(commissionSummary.receivable_commission)
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Commission history</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent commission records ({commissionDistributionCount} total).
              </p>
            </CardHeader>
            <CardContent>
              {commissionDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No commission records yet.</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investment ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid at</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionDistribution.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-sm">
                            {c.investment_display_id ?? c.id}
                          </TableCell>
                          <TableCell className="tabular-nums font-medium">
                            {formatINR(c.amount)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={c.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {c.paid_at ? formatDate(c.paid_at) : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateOnly(c.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Profile & documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Contact and KYC documents.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Contact</h4>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {rm.email}
                  </li>
                  {rm.phone_number && (
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {rm.phone_number}
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Created {formatDateOnly(rm.created_at)}
                  </li>
                </ul>
              </div>
              {(rm.aadhaar_front_image_url || rm.pan_image_url) && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Documents (click to enlarge)</h4>
                  <div className="flex flex-wrap gap-3">
                    {rm.aadhaar_front_image_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setImagePreview({
                            open: true,
                            url: rm.aadhaar_front_image_url,
                            title: "Aadhaar (front)",
                          })
                        }
                        className="rounded-lg border border-border overflow-hidden bg-muted hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-opacity"
                      >
                        <img
                          src={rm.aadhaar_front_image_url}
                          alt="Aadhaar (front)"
                          className="h-16 w-16 object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E"
                          }}
                        />
                      </button>
                    )}
                    {rm.pan_image_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setImagePreview({
                            open: true,
                            url: rm.pan_image_url,
                            title: "PAN",
                          })
                        }
                        className="rounded-lg border border-border overflow-hidden bg-muted hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-opacity"
                      >
                        <img
                          src={rm.pan_image_url}
                          alt="PAN"
                          className="h-16 w-16 object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E"
                          }}
                        />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditRMModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        rm={rm}
        onSuccess={handleEditSuccess}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        entity={rm}
        entityName="RM"
        onSuccess={handleDeleteSuccess}
      />
      <ImageViewerModal
        isOpen={imagePreview.open}
        onClose={() => setImagePreview((prev) => ({ ...prev, open: false }))}
        imageUrl={imagePreview.url}
        title={imagePreview.title}
      />
    </div>
  )
}

export default RMDetailPage
