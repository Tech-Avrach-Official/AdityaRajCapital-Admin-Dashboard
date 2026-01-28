import React, { useCallback, useState } from "react"
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * ImageDropzone - Reusable file upload component with drag-drop and preview
 *
 * @param {Object} props
 * @param {string} props.label - Label text above dropzone
 * @param {File} props.value - Current file value
 * @param {Function} props.onChange - Called with file or null
 * @param {string} props.error - Error message to display
 * @param {string} props.accept - Accepted MIME types (default: "image/jpeg,image/png")
 * @param {number} props.maxSize - Max file size in bytes (default: 5MB)
 * @param {string} props.className - Additional CSS classes
 */
const ImageDropzone = ({
  label,
  value,
  onChange,
  error,
  accept = "image/jpeg,image/png",
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [localError, setLocalError] = useState("")

  // Format bytes to readable string
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Validate file
  const validateFile = (file) => {
    setLocalError("")

    // Check file type
    const acceptedTypes = accept.split(",").map((t) => t.trim())
    if (!acceptedTypes.includes(file.type)) {
      setLocalError("Invalid file type. Please upload JPG or PNG.")
      return false
    }

    // Check file size
    if (file.size > maxSize) {
      setLocalError(`File too large. Maximum size is ${formatBytes(maxSize)}.`)
      return false
    }

    return true
  }

  // Create preview from file
  const createPreview = (file) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Handle file selection
  const handleFile = useCallback(
    (file) => {
      if (!file) return

      if (validateFile(file)) {
        createPreview(file)
        onChange(file)
      }
    },
    [onChange, accept, maxSize]
  )

  // Handle drag events
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
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  // Handle click to browse
  const handleClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = accept
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    }
    input.click()
  }

  // Handle remove file
  const handleRemove = (e) => {
    e.stopPropagation()
    setPreview(null)
    setLocalError("")
    onChange(null)
  }

  const displayError = error || localError
  const hasFile = value && preview

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Dropzone */}
      <div
        onClick={!hasFile ? handleClick : undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200",
          "flex flex-col items-center justify-center",
          hasFile ? "p-2" : "p-6 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : displayError
              ? "border-destructive bg-destructive/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
        )}
      >
        {hasFile ? (
          /* Preview */
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-contain rounded-md bg-muted"
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {/* File name */}
            <p className="text-xs text-muted-foreground mt-2 text-center truncate">
              {value.name}
            </p>
          </div>
        ) : (
          /* Upload prompt */
          <>
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}
            >
              {isDragging ? (
                <Upload className="w-6 h-6 text-primary" />
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-foreground font-medium">
              {isDragging ? "Drop the file here" : "Drop file or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG/PNG, max {formatBytes(maxSize)}
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{displayError}</span>
        </div>
      )}
    </div>
  )
}

export default ImageDropzone
