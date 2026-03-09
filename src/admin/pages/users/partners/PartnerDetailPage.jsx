import React, { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  FileText,
  Eye,
  X,
  UserCog,
} from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import StatusBadge from "@/components/common/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ImageViewerModal from "@/components/common/ImageViewerModal"
import ChangeRMModal from "./components/ChangeRMModal"
import { usersService } from "@/lib/api/services"

const isPdfUrl = (url, docType) => {
  if (!url) return false
  const u = (url || "").toLowerCase()
  const t = (docType || "").toLowerCase()
  return u.includes(".pdf") || u.includes("application/pdf") || t.includes("pdf")
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return dateStr
  }
}

const formatINR = (amount) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const PartnerDetailPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [imagePreview, setImagePreview] = useState({ open: false, url: null, title: null })
  const [changeRMModalOpen, setChangeRMModalOpen] = useState(false)

  const partner = detail?.partner ?? location.state?.partner ?? null

  useEffect(() => {
    if (!id) return
    setLoading(true)
    usersService
      .getPartner(id)
      .then((data) => {
        setDetail(data)
      })
      .catch(() => toast.error("Failed to load partner"))
      .finally(() => setLoading(false))
  }, [id])

  const handleRMChangeSuccess = () => {
    setChangeRMModalOpen(false)
    toast.success("Partner RM changed successfully")
    usersService.getPartner(id).then(setDetail)
  }

  if (loading && !partner) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!detail && !partner) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/admin/users/partners">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </Link>
        </Button>
        <p className="text-muted-foreground">Partner not found.</p>
      </div>
    )
  }

  const p = detail?.partner ?? partner
  const rm = detail?.rm ?? partner?.rm ?? null
  const kyc = detail?.kyc ?? null
  const documents = detail?.documents ?? []
  const nominee = detail?.nominee ?? null
  const referralSummary = detail?.referral_summary ?? partner?.referral_summary ?? null
  const referredInvestors = detail?.referred_investors ?? []
  const goals = detail?.goals ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users/partners">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </Link>
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <PageHeader
            title={p?.name}
            description={`${p?.partner_referral_code ?? p?.referral_code ?? ""} · ${p?.email ?? ""}`}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChangeRMModalOpen(true)}
            disabled={!p}
          >
            <UserCog className="h-4 w-4 mr-2" />
            Change RM
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{p?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referral code</p>
              <p className="font-medium font-mono">{p?.partner_referral_code ?? p?.referral_code ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{p?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-medium">{p?.mobile ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={p?.status ?? "active"} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signup status</p>
              <p className="font-medium">{p?.signup_status ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email verified</p>
              <p className="font-medium">{p?.email_verified_at ? formatDate(p.email_verified_at) : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile verified</p>
              <p className="font-medium">{p?.mobile_verified_at ? formatDate(p.mobile_verified_at) : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(p?.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="font-medium">{formatDate(p?.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {rm && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned RM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">RM name</p>
                <p className="font-medium">{rm.rm_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RM code</p>
                <p className="font-medium font-mono">{rm.rm_code ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RM status</p>
                <StatusBadge status={rm.rm_status ?? "active"} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {referralSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Referral summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Referred investors</p>
                <p className="font-medium">{referralSummary.referred_investors_count ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total invested by referred</p>
                <p className="font-medium">{formatINR(referralSummary.total_invested_by_referred)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(kyc || documents.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>KYC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kyc && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {kyc.kyc_verified != null && (
                  <div>
                    <p className="text-muted-foreground">KYC verified</p>
                    <p className="font-medium">{kyc.kyc_verified ? "Yes" : "No"}</p>
                  </div>
                )}
                {kyc.aadhar_name != null && (
                  <div>
                    <p className="text-muted-foreground">Aadhaar name</p>
                    <p className="font-medium">{kyc.aadhar_name}</p>
                  </div>
                )}
                {kyc.aadhar_number != null && (
                  <div>
                    <p className="text-muted-foreground">Aadhaar number</p>
                    <p className="font-medium">{kyc.aadhar_number}</p>
                  </div>
                )}
                {kyc.pan_number != null && (
                  <div>
                    <p className="text-muted-foreground">PAN</p>
                    <p className="font-medium">{kyc.pan_number}</p>
                  </div>
                )}
                {kyc.bank_name != null && (
                  <div>
                    <p className="text-muted-foreground">Bank</p>
                    <p className="font-medium">{kyc.bank_name}</p>
                  </div>
                )}
                {kyc.bank_account_number != null && (
                  <div>
                    <p className="text-muted-foreground">Account number</p>
                    <p className="font-medium">{kyc.bank_account_number}</p>
                  </div>
                )}
              </div>
            )}
            {documents.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">KYC Documents</p>
                <ul className="space-y-2">
                  {documents.map((doc, idx) => {
                    const label = doc.document_type ?? "Document"
                    const isPdf = isPdfUrl(doc.url, doc.document_type)
                    return (
                      <li key={idx} className="flex items-center gap-3 flex-wrap">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium min-w-[140px]">{label}</span>
                        {doc.url && (
                          <span className="flex items-center gap-2">
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
                              Preview
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-primary" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                Open <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                              </a>
                            </Button>
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {nominee && (
        <Card>
          <CardHeader>
            <CardTitle>Nominee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{nominee.nominee_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relation</p>
                <p className="font-medium">{nominee.nominee_relation ?? "—"}</p>
              </div>
              {nominee.nominee_dob && (
                <div>
                  <p className="text-sm text-muted-foreground">DOB</p>
                  <p className="font-medium">{nominee.nominee_dob}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {referredInvestors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referred investors ({referredInvestors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Total invested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referredInvestors.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono">{inv.client_id ?? "—"}</TableCell>
                      <TableCell>{inv.name ?? "—"}</TableCell>
                      <TableCell>{inv.email ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={inv.kyc_complete === 1 ? "verified" : "pending"} />
                      </TableCell>
                      <TableCell>{inv.purchase_summary?.total_verified_count ?? 0}</TableCell>
                      <TableCell>{formatINR(inv.purchase_summary?.total_invested_amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Goals ({detail?.goals_total ?? goals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Achieved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{g.period ?? "—"}</TableCell>
                      <TableCell>{g.goal_type ?? "—"}</TableCell>
                      <TableCell>{formatINR(g.target)}</TableCell>
                      <TableCell>{formatINR(g.achieved)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

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
        partner={detail?.partner ?? partner}
        onSuccess={handleRMChangeSuccess}
      />
    </div>
  )
}

export default PartnerDetailPage
