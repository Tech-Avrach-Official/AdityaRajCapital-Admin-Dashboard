import React, { useState, useEffect } from "react"
import { X, ZoomIn, ZoomOut, Download, RotateCw, ExternalLink, FileText, Loader2 } from "lucide-react"
import { purchasesService } from "@/lib/api/services/purchasesService"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

/**
 * Format currency in INR
 */
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * PaymentProofModal - View payment proof documents (images or PDFs)
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.purchase - Purchase object containing proof details
 */
const PaymentProofModal = ({ isOpen, onClose, purchase }) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [fetchedUrls, setFetchedUrls] = useState([]) // API returns data.urls array
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState(null)

  // Fetch signed URL(s) - GET /api/admin/purchases/:id/payment-proof-url returns data.urls[]
  useEffect(() => {
    if (!isOpen || !purchase?.id) {
      setFetchedUrls([])
      setUrlError(null)
      return
    }

    const singleInlineUrl = purchase.resolved_payment_proof_url || purchase.payment_proof_url
    if (singleInlineUrl) {
      setFetchedUrls([singleInlineUrl])
      setUrlError(null)
      return
    }

    let cancelled = false
    setLoadingUrl(true)
    setUrlError(null)

    purchasesService
      .getPaymentProofUrl(purchase.id)
      .then((result) => {
        if (!cancelled) {
          const urls = result?.urls && Array.isArray(result.urls) ? result.urls : []
          setFetchedUrls(urls)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setUrlError(err?.message || "Failed to load payment proof")
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUrl(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, purchase?.id])

  if (!purchase) return null

  const {
    id,
    plan_name,
    amount,
    investor_name,
    investor_id,
    payment_proof_uploaded_at,
    resolved_payment_proof_url,
    payment_proof_url,
    payment_proof_file_path,
    payment_proof_file_type,
  } = purchase

  // Build array of proof URLs (inline single or fetched array)
  const proofUrls =
    fetchedUrls.length > 0
      ? fetchedUrls
      : resolved_payment_proof_url || payment_proof_url
        ? [resolved_payment_proof_url || payment_proof_url]
        : []
  const proofUrl = proofUrls[0] || null
  const hasMultiple = proofUrls.length > 1
  const fileType = payment_proof_file_type || "unknown"
  const isImage = fileType === "image"
  const isPdf = fileType === "pdf"

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const getDownloadFilename = (fileIndex) => {
    const base = `payment-proof-${id}`
    const suffix = fileIndex != null ? `-${fileIndex + 1}` : ""
    return `${base}${suffix}.png`
  }

  const handleDownload = async (urlToUse = proofUrl, fileIndex = null) => {
    if (!urlToUse) return

    const filename = getDownloadFilename(fileIndex)

    try {
      const response = await fetch(urlToUse, { mode: "cors", credentials: "omit" })
      if (!response.ok) throw new Error(response.statusText)
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
    } catch {
      // CORS or network error: try forcing download via anchor (no fetch).
      // Browser may still open in new tab if response is inline; then user can right-click → Save.
      const link = document.createElement("a")
      link.href = urlToUse
      link.download = filename
      link.rel = "noopener noreferrer"
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleOpenInNewTab = (urlToUse = proofUrl) => {
    if (urlToUse) window.open(urlToUse, "_blank", "noopener,noreferrer")
  }

  const handleClose = () => {
    // Reset state on close
    setZoom(1)
    setRotation(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">
              Payment Proof - {id}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* Zoom controls - only for images */}
              {isImage && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[50px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>

                  {/* Rotate */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRotate}
                    title="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Open in new tab - first proof */}
              {proofUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenInNewTab()}
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              {/* Download - first proof */}
              {proofUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload()}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Purchase Details Summary */}
        <div className="px-4 py-3 bg-muted/50 border-b flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Investor:</span>
              <p className="font-medium">{investor_name || investor_id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Plan:</span>
              <p className="font-medium">{plan_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <p className="font-semibold text-green-600">{formatINR(amount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Uploaded:</span>
              <p className="font-medium">
                {payment_proof_uploaded_at
                  ? format(new Date(payment_proof_uploaded_at), "MMM dd, yyyy HH:mm")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Content container */}
        <div className="flex-1 min-h-0 overflow-auto bg-gray-900/95 flex items-center justify-center p-4">
          {loadingUrl ? (
            <div className="text-center text-gray-400">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
              <p>Loading payment proof...</p>
            </div>
          ) : urlError ? (
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Could not load payment proof</p>
              <p className="text-sm mt-2 text-red-400">{urlError}</p>
            </div>
          ) : proofUrls.length > 0 ? (
            <>
              {hasMultiple ? (
                <div className="w-full max-w-5xl py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {proofUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-2 rounded-lg overflow-hidden bg-black/30 border border-white/10 p-2"
                      >
                        <div className="w-full flex justify-center bg-black/20 rounded min-h-[120px]">
                          <img
                            src={url}
                            alt={`Payment proof ${index + 1}`}
                            className="max-h-[50vh] max-w-full w-auto object-contain"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Payment proof {index + 1} of {proofUrls.length}</p>
                        <div className="flex gap-2 flex-wrap justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenInNewTab(url)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownload(url, index)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {isImage && (
                    <div
                      className="transition-transform duration-200 ease-out"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                    >
                      <img
                        src={proofUrl}
                        alt="Payment Proof"
                        className="max-w-full max-h-full object-contain"
                        style={{
                          maxHeight: "calc(90vh - 200px)",
                        }}
                      />
                    </div>
                  )}

                  {isPdf && (
                    <iframe
                      src={proofUrl}
                      className="w-full h-full border-0"
                      title="Payment Proof PDF"
                    />
                  )}

                  {!isImage && !isPdf && (
                    <div className="text-center text-gray-400">
                      <FileText className="w-16 h-16 mx-auto mb-4" />
                      <p>Unable to preview this file type</p>
                      <p className="text-sm mt-2">File path: {payment_proof_file_path}</p>
                      <Button
                        variant="secondary"
                        className="mt-4"
                        onClick={() => handleOpenInNewTab()}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">No payment proof available</p>
              {payment_proof_file_path && (
                <p className="text-sm mt-2">File path: {payment_proof_file_path}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground text-center flex-shrink-0">
          {isImage && "Use zoom and rotate controls to adjust the image view."}
          {isPdf && "PDF document displayed in viewer. Use the toolbar above to download or open in a new tab."}
          {!isImage && !isPdf && proofUrl && "Click 'Open in New Tab' to view the file."}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentProofModal
