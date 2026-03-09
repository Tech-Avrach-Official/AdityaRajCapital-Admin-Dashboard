import React from "react"
import { X, FileImage, Loader2, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const isPdfUrl = (url) => {
  if (!url) return false
  const u = String(url).toLowerCase()
  return u.includes(".pdf") || u.includes("application/pdf")
}

/**
 * DocumentPreviewModal – Reusable scrollable modal to show multiple documents (images/PDFs).
 * Use for KYC documents, nominee documents, payment proof (multi-image), etc.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {Array<{ label: string, url: string }>} props.documents - List of documents to display
 * @param {boolean} props.loading - Show loading state
 * @param {string|null} props.error - Error message (if set, shows error state)
 * @param {string} props.emptyMessage - Message when documents.length === 0 and not loading/error
 * @param {React.ReactNode} props.subtitle - Optional summary/subtitle below header (e.g. purchase details)
 */
const DocumentPreviewModal = ({
  isOpen,
  onClose,
  title,
  documents = [],
  loading = false,
  error = null,
  emptyMessage = "No documents available.",
  subtitle = null,
}) => {
  const handleOpenChange = (open) => {
    if (!open) onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-base truncate pr-4">{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} title="Close">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {subtitle && (
          <div className="px-4 py-3 border-b flex-shrink-0 bg-muted/30">
            {subtitle}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-3" />
              <p className="text-sm">Loading documents…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileImage className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">{error}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileImage className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">{emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {documents.map((doc, idx) => {
                const url = doc.url || doc.signed_url
                const pdf = url && isPdfUrl(url)
                const label = doc.label || doc.document_type || "Document"
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-border/60 overflow-hidden bg-muted/20"
                  >
                    <p className="px-3 py-2 text-sm font-medium text-foreground border-b border-border/60 bg-muted/40">
                      {label}
                    </p>
                    <div className="p-3 flex justify-center bg-background min-h-[160px] relative">
                      {url ? (
                        pdf ? (
                          <div className="w-full flex flex-col items-center gap-2">
                            <iframe
                              src={url}
                              title={label}
                              className="w-full rounded border border-border/60"
                              style={{ minHeight: "320px", maxHeight: "50vh" }}
                            />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open in new tab
                            </a>
                          </div>
                        ) : (
                          <>
                            <img
                              src={url}
                              alt={label}
                              className="max-w-full h-auto max-h-[50vh] object-contain rounded"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.style.display = "none"
                                const next = e.target.nextElementSibling
                                if (next) next.classList.remove("hidden")
                              }}
                            />
                            <div className="hidden text-sm text-muted-foreground text-center py-8 px-4">
                              Failed to load image.
                            </div>
                          </>
                        )
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-8 px-4">
                          No URL for this document.
                        </div>
                      )}
                    </div>
                    {url && !pdf && (
                      <div className="px-3 py-2 border-t border-border/60 bg-muted/30 text-xs flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Open in new tab
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentPreviewModal
