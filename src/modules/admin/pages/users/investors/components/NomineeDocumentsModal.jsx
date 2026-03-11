import React, { useState, useEffect } from "react"
import { usersService } from "@/modules/admin/api/services/usersService"
import DocumentPreviewModal from "@/components/common/DocumentPreviewModal"

const DOCUMENT_LABELS = {
  nominee_aadhar_front: "Aadhaar (Front)",
  nominee_aadhar_back: "Aadhaar (Back)",
  aadhar_front: "Aadhaar (Front)",
  aadhar_back: "Aadhaar (Back)",
}

/** Build documents list from nominee list API inline URLs (nominee_aadhar_front_url, nominee_aadhar_back_url) */
function documentsFromNominee(nominee) {
  if (!nominee) return []
  const list = []
  const frontUrl = nominee.nominee_aadhar_front_url || nominee.nominee_aadhar_front_signed_url
  const backUrl = nominee.nominee_aadhar_back_url || nominee.nominee_aadhar_back_signed_url
  if (frontUrl) list.push({ label: DOCUMENT_LABELS.nominee_aadhar_front, url: frontUrl })
  if (backUrl) list.push({ label: DOCUMENT_LABELS.nominee_aadhar_back, url: backUrl })
  return list
}

/**
 * NomineeDocumentsModal – Uses DocumentPreviewModal.
 * Prefers nominee list API inline URLs; otherwise fetches from GET .../nominees/:nomineeId/documents.
 */
const NomineeDocumentsModal = ({ isOpen, onClose, nominee, investorId }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [urlError, setUrlError] = useState(null)

  useEffect(() => {
    if (!isOpen || !nominee) {
      setDocuments([])
      setUrlError(null)
      return
    }

    const inlineDocs = documentsFromNominee(nominee)
    if (inlineDocs.length > 0) {
      setDocuments(inlineDocs)
      setUrlError(null)
      setLoading(false)
      return
    }

    if (!nominee?.id || !investorId) {
      setDocuments([])
      setUrlError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setUrlError(null)

    usersService
      .getNomineeDocumentUrls(investorId, nominee.id)
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          setDocuments(
            list.map((d) => ({
              label: DOCUMENT_LABELS[d.document_type] || d.document_type || "Document",
              url: d.url || d.signed_url,
            }))
          )
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setUrlError(err?.message || "Failed to load documents")
          setDocuments([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, nominee?.id, investorId])

  const nomineeName = nominee?.name ?? nominee?.nominee_name ?? "Nominee"
  const title = `Documents – ${nomineeName}`

  return (
    <DocumentPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      documents={documents}
      loading={loading}
      error={urlError}
      emptyMessage="No documents available for this nominee."
    />
  )
}

export default NomineeDocumentsModal
