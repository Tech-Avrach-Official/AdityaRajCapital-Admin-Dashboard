import React, { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { ArrowLeft, Loader2, ExternalLink, FileText, Eye, X } from "lucide-react"
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
import { usersService } from "@/lib/api/services"

const isPdfUrl = (url, docType) => {
  if (!url) return false
  const u = url.toLowerCase()
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

const InvestorDetailPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const [investor, setInvestor] = useState(location.state?.investor ?? null)
  const [kycData, setKycData] = useState(null)
  const [nominees, setNominees] = useState(null)
  const [bankAccounts, setBankAccounts] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [purchasesTotal, setPurchasesTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [imagePreview, setImagePreview] = useState({ open: false, url: null, title: null })

  useEffect(() => {
    if (!id) return
    if (!investor) {
      setLoading(true)
      usersService
        .getInvestor(id)
        .then((data) => {
          setInvestor(data)
        })
        .catch(() => toast.error("Failed to load investor"))
        .finally(() => setLoading(false))
    }
  }, [id, investor])

  useEffect(() => {
    if (!id) return
    setLoadingDetail(true)
    Promise.all([
      usersService.getInvestorKycData(id).catch(() => null),
      usersService.getInvestorNominees(id).catch(() => null),
      usersService.getInvestorBankAccounts(id).catch(() => null),
      usersService.getInvestorPurchases(id).catch(() => ({ purchases: [], total: 0 })),
    ])
      .then(([kyc, nom, bank, pur]) => {
        setKycData(kyc)
        setNominees(nom?.nominees ?? nom ?? [])
        const banks = bank?.bank_accounts ?? bank ?? []
        setBankAccounts(Array.isArray(banks) ? banks : [])
        const list = pur?.purchases ?? pur ?? []
        setPurchases(Array.isArray(list) ? list : [])
        setPurchasesTotal(pur?.total ?? 0)
      })
      .finally(() => setLoadingDetail(false))
  }, [id])

  if (loading && !investor) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!investor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/admin/users/investors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Investors
          </Link>
        </Button>
        <p className="text-muted-foreground">Investor not found.</p>
      </div>
    )
  }

  const kyc = kycData?.kyc ?? {}
  const documents = kycData?.documents ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users/investors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Investors
          </Link>
        </Button>
        <PageHeader
          title={investor.name}
          description={`${investor.client_id ?? investor.investorId ?? ""} · ${investor.email ?? ""}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{investor.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client ID</p>
              <p className="font-medium">{investor.client_id ?? investor.investorId ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{investor.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-medium">{investor.mobile ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={investor.status ?? "active"} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KYC</p>
              <StatusBadge status={investor.kyc_complete === 1 ? "verified" : "pending"} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partner</p>
              <p className="font-medium">
                {investor.partner?.partner_name ?? investor.partnerName ?? "Direct"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referral code</p>
              <p className="font-medium">{investor.referral_code ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email verified</p>
              <p className="font-medium">{investor.email_verified_at ? formatDate(investor.email_verified_at) : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile verified</p>
              <p className="font-medium">{investor.mobile_verified_at ? formatDate(investor.mobile_verified_at) : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">MPIN set</p>
              <p className="font-medium">{investor.mpin_set_at ? formatDate(investor.mpin_set_at) : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Has nominees</p>
              <p className="font-medium">{investor.has_nominees === 1 ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(investor.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="font-medium">{formatDate(investor.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingDetail ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {(Object.keys(kyc).length > 0 || documents.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>KYC</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(kyc).length > 0 && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {kyc.kyc_verified != null && (
                      <div>
                        <p className="text-muted-foreground">KYC verified</p>
                        <p className="font-medium">{kyc.kyc_verified ? "Yes" : "No"}</p>
                      </div>
                    )}
                    {kyc.name_match_status != null && (
                      <div>
                        <p className="text-muted-foreground">Name match</p>
                        <p className="font-medium">{String(kyc.name_match_status)}</p>
                      </div>
                    )}
                    {kyc.ocr_processing_status != null && (
                      <div>
                        <p className="text-muted-foreground">OCR status</p>
                        <p className="font-medium">{String(kyc.ocr_processing_status)}</p>
                      </div>
                    )}
                    {kyc.aadhaar != null && (
                      <div>
                        <p className="text-muted-foreground">Aadhaar</p>
                        <p className="font-medium">{typeof kyc.aadhaar === "object" ? JSON.stringify(kyc.aadhaar) : String(kyc.aadhaar)}</p>
                      </div>
                    )}
                    {kyc.pan != null && (
                      <div>
                        <p className="text-muted-foreground">PAN</p>
                        <p className="font-medium">{typeof kyc.pan === "object" ? JSON.stringify(kyc.pan) : String(kyc.pan)}</p>
                      </div>
                    )}
                    {kyc.address != null && (
                      <div>
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium">{typeof kyc.address === "object" ? JSON.stringify(kyc.address) : String(kyc.address)}</p>
                      </div>
                    )}
                    {kyc.bank != null && (
                      <div>
                        <p className="text-muted-foreground">Bank</p>
                        <p className="font-medium">{typeof kyc.bank === "object" ? JSON.stringify(kyc.bank) : String(kyc.bank)}</p>
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
                            <span className="text-sm font-medium min-w-[120px]">{label}</span>
                            {doc.url && (
                              <span className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    if (isPdf) {
                                      setPreviewDoc({ url: doc.url, title: label })
                                    } else {
                                      setImagePreview({ open: true, url: doc.url, title: label })
                                    }
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-primary"
                                  asChild
                                >
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

          {Array.isArray(nominees) && nominees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nominees ({nominees.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="admin-table-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Relation</TableHead>
                        <TableHead>Share %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nominees.map((n, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{n.name ?? n.nominee_name ?? "—"}</TableCell>
                          <TableCell>{n.relation ?? "—"}</TableCell>
                          <TableCell>{n.share_percent ?? n.share ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {Array.isArray(bankAccounts) && bankAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bank accounts ({bankAccounts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="admin-table-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bank / Account</TableHead>
                        <TableHead>Account number</TableHead>
                        <TableHead>IFSC</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankAccounts.map((b, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{b.bank_name ?? b.name ?? "—"}</TableCell>
                          <TableCell>{b.account_number ?? b.account_no ?? "—"}</TableCell>
                          <TableCell>{b.ifsc ?? "—"}</TableCell>
                          <TableCell>{b.is_active === false ? "Inactive" : "Active"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Purchases ({purchasesTotal})</CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchases.</p>
              ) : (
                <div className="admin-table-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((p) => (
                        <TableRow key={p.id ?? p.purchase_id}>
                          <TableCell>{p.plan_name ?? p.plan?.name ?? p.plan_id ?? "—"}</TableCell>
                          <TableCell>{formatINR(p.amount ?? p.investment_amount)}</TableCell>
                          <TableCell>
                            <StatusBadge status={p.status ?? "—"} />
                          </TableCell>
                          <TableCell>{formatDate(p.created_at ?? p.initialized_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* PDF preview modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b flex-shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="text-base truncate pr-4">
              {previewDoc?.title ?? "Document"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewDoc(null)}
              title="Close"
            >
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

      {/* Image preview modal */}
      <ImageViewerModal
        isOpen={imagePreview.open}
        onClose={() => setImagePreview((p) => ({ ...p, open: false }))}
        imageUrl={imagePreview.url}
        title={imagePreview.title}
      />
    </div>
  )
}

export default InvestorDetailPage
