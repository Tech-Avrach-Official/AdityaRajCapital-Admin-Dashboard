import React, { useState, useEffect } from "react"
import { ExternalLink, FileImage, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { kycService, KYC_DOCUMENT_LABELS } from "@/modules/admin/api/services/kycService"
import { cn } from "@/lib/utils"

const IMAGE_TYPES = ["aadhar_front", "aadhar_back", "pan_card", "cancelled_cheque"]

function isLikelyImage(url) {
  if (!url) return false
  const u = url.toLowerCase()
  return (
    u.includes("image") ||
    /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(u) ||
    u.includes("content-type")
  )
}

export default function KYCDocumentViewModal({ open, onClose, row }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !row) {
      setDocuments([])
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    kycService
      .getKycDocumentsForRow(row)
      .then((list) => {
        if (!cancelled) {
          setDocuments(Array.isArray(list) ? list : [])
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to load documents")
          setDocuments([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, row])

  const userName = row?.userName ?? row?.name ?? "User"
  const role = (row?.role ?? row?.type ?? "").toLowerCase()

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            KYC Documents – {userName}
            {role && (
              <span className="ml-2 text-sm font-normal capitalize text-muted-foreground">
                ({role})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No KYC documents available.
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {documents.map((doc) => {
              const label =
                KYC_DOCUMENT_LABELS[doc.document_type] ??
                doc.document_type?.replace(/_/g, " ") ??
                "Document"
              const url = doc.url
              const showImg = url && isLikelyImage(url)

              return (
                <div
                  key={doc.document_type}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <p className="mb-3 text-sm font-medium text-foreground">{label}</p>
                  {showImg && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded border border-border bg-white"
                    >
                      <img
                        src={url}
                        alt={label}
                        className="h-40 w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none"
                          const next = e.target.nextSibling
                          if (next) next.classList.remove("hidden")
                        }}
                      />
                      <span className="hidden text-center text-xs text-muted-foreground">
                        Image failed to load
                      </span>
                    </a>
                  )}
                  {!showImg && url && (
                    <div className="flex h-24 items-center justify-center rounded border border-border bg-muted/50">
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open in new tab
                      </a>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          Signed URLs expire in 1 hour. Re-open this modal to refresh links if needed.
        </p>
      </DialogContent>
    </Dialog>
  )
}
