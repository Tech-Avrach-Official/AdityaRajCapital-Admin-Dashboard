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
  const [fetchedUrl, setFetchedUrl] = useState(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState(null)

  // Fetch signed URL when no URL available but purchase has id (GET /api/admin/purchases/:id/payment-proof-url)
  useEffect(() => {
    if (!isOpen || !purchase?.id) {
      setFetchedUrl(null)
      setUrlError(null)
      return
    }

    const hasUrl = purchase.resolved_payment_proof_url || purchase.payment_proof_url
    if (hasUrl) {
      setFetchedUrl(null)
      setUrlError(null)
      return
    }

    let cancelled = false
    setLoadingUrl(true)
    setUrlError(null)

    purchasesService
      .getPaymentProofUrl(purchase.id)
      .then((url) => {
        if (!cancelled) {
          setFetchedUrl(url)
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

  // Get the URL to display (prefer inline URL, then fetched signed URL)
  const proofUrl = resolved_payment_proof_url || payment_proof_url || fetchedUrl
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

  const handleDownload = async () => {
    if (!proofUrl) return

    try {
      const response = await fetch(proofUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `payment-proof-${id}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      // Fallback: open in new tab
      window.open(proofUrl, "_blank")
    }
  }

  const handleOpenInNewTab = () => {
    if (proofUrl) {
      window.open(proofUrl, "_blank")
    }
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

              {/* Open in new tab */}
              {proofUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenInNewTab}
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              {/* Download */}
              {proofUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
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
        <div className="flex-1 overflow-auto bg-gray-900/95 flex items-center justify-center p-4">
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
          ) : proofUrl ? (
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
                    onClick={handleOpenInNewTab}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
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
