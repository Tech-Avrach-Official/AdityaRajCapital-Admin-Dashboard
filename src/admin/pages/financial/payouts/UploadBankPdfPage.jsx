import React, { useCallback, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { ArrowLeft, FileText, Upload, X, Loader2 } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { financialService } from "@/lib/api/services"
import { cn } from "@/lib/utils"

const ACCEPT = "application/pdf"
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const UploadBankPdfPage = () => {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)

  const validateFile = useCallback((f) => {
    setError("")
    if (f.type !== ACCEPT) {
      setError("Please upload a PDF file only.")
      return false
    }
    if (f.size > MAX_SIZE) {
      setError(`File too large. Maximum size is ${formatBytes(MAX_SIZE)}.`)
      return false
    }
    return true
  }, [])

  const handleFile = useCallback(
    (f) => {
      if (!f) return
      if (validateFile(f)) setFile(f)
    },
    [validateFile]
  )

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files?.length > 0) handleFile(files[0])
  }

  const handleClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ACCEPT
    input.onchange = (e) => {
      const f = e.target.files?.[0]
      if (f) handleFile(f)
    }
    input.click()
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    setFile(null)
    setError("")
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file first.")
      return
    }
    setUploading(true)
    setError("")
    try {
      await financialService.uploadBankPDF(file)
      toast.success("Bank PDF uploaded successfully. Processing may take a moment.")
      setFile(null)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Upload failed"
      toast.error(msg)
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/financial/payouts" className="hover:text-foreground transition-colors">
          Payouts
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Upload Bank PDF</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Upload Bank PDF"
          description="Upload your bank statement or payout PDF to match and process payouts."
        />
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/financial/payouts" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Payouts
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-md w-full">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            Bank statement / payout PDF
          </CardTitle>
          <CardDescription>
            Drag and drop your PDF here, or click to browse. Supported: PDF only, max {formatBytes(MAX_SIZE)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div
            onClick={!file ? handleClick : undefined}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-xl border-2 border-dashed transition-all duration-200",
              "flex flex-col items-center justify-center min-h-[280px]",
              file ? "p-6 border-border bg-muted/20" : "p-8 cursor-pointer",
              isDragging && "border-primary bg-primary/5 scale-[1.01]",
              !file && !isDragging && "border-border hover:border-primary/50 hover:bg-muted/30",
              error && "border-destructive/50 bg-destructive/5"
            )}
          >
            {file ? (
              <div className="flex flex-col items-center w-full max-w-sm">
                <div className="flex items-center gap-3 rounded-lg bg-background border border-border/60 px-4 py-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={handleRemove}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Click the X to remove and choose another file.</p>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                    isDragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Upload className="h-8 w-8" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  {isDragging ? "Drop the PDF here" : "Drop your PDF here, or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">PDF only · Max {formatBytes(MAX_SIZE)}</p>
              </>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive mt-3">{error}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/financial/payouts">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UploadBankPdfPage
