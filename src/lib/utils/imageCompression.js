/**
 * Client-side image compression for uploads.
 * Reduces file size to avoid 413 Request Entity Too Large (server body size limit).
 *
 * @param {File} file - Image file (JPEG/PNG)
 * @param {Object} options - maxWidth, maxHeight (pixels), quality (0-1), maxSizeBytes (target max size)
 * @returns {Promise<File>} - Compressed file (JPEG)
 */
const DEFAULT_MAX_WIDTH = 1200
const DEFAULT_MAX_HEIGHT = 1200
const DEFAULT_QUALITY = 0.85
const DEFAULT_MAX_SIZE_BYTES = 500 * 1024 // 500KB per image

export function compressImageForUpload(file, options = {}) {
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT
  const quality = options.quality ?? DEFAULT_QUALITY
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      resolve(file)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width <= maxWidth && height <= maxHeight && file.size <= maxSizeBytes) {
        resolve(file)
        return
      }

      const scale = Math.min(maxWidth / width, maxHeight / height, 1)
      width = Math.round(width * scale)
      height = Math.round(height * scale)

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      const tryQuality = (q) => {
        return new Promise((res) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                res(null)
                return
              }
              const name = file.name.replace(/\.[^.]+$/, "") || "image"
              const out = new File([blob], `${name}.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              res(out)
            },
            "image/jpeg",
            q
          )
        })
      }

      const attempt = (q) => {
        tryQuality(q).then((out) => {
          if (!out) {
            resolve(file)
            return
          }
          if (out.size <= maxSizeBytes || q <= 0.5) {
            resolve(out)
            return
          }
          attempt(Math.max(0.5, q - 0.15))
        })
      }

      attempt(quality)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }

    img.src = url
  })
}
