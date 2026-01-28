import React, { useState } from "react"
import { X, ZoomIn, ZoomOut, Download, RotateCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * ImageViewerModal - View images in fullscreen with zoom and download
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.imageUrl - URL of image to display
 * @param {string} props.title - Title/filename
 */
const ImageViewerModal = ({ isOpen, onClose, imageUrl, title }) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

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
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = title || "image"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      // Fallback: open in new tab
      window.open(imageUrl, "_blank")
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
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base truncate pr-4">
              {title || "Image Preview"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
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

              {/* Download */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>

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

        {/* Image container */}
        <div className="flex-1 overflow-auto bg-gray-900/95 flex items-center justify-center p-4">
          {imageUrl ? (
            <div
              className="transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={imageUrl}
                alt={title || "Preview"}
                className="max-w-full max-h-full object-contain"
                style={{
                  maxHeight: "calc(90vh - 100px)",
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>No image to display</p>
            </div>
          )}
        </div>

        {/* Footer with instructions */}
        <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground text-center flex-shrink-0">
          Use zoom controls to adjust size. Click download to save the image.
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageViewerModal
