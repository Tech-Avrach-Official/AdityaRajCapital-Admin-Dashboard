import React, { useState, useEffect } from "react"
import { usersService } from "@/lib/api/services"
import DocumentPreviewModal from "@/components/common/DocumentPreviewModal"

const KYC_DOCUMENT_LABELS = {
  aadhar_front: "Aadhaar (Front)",
  aadhar_back: "Aadhaar (Back)",
  pan_card: "PAN Card",
  cancelled_cheque: "Cancelled Cheque",
}

/**
 * KYCDocumentsModal – KYC documents in a popup using DocumentPreviewModal.
 * Fetches signed document URLs via getInvestorKycDocuments(investorId).
 */
const KYCDocumentsModal = ({ isOpen, onClose, investorId, investorName }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [urlError, setUrlError] = useState(null)

  useEffect(() => {
    if (!isOpen || !investorId) {
      setDocuments([])
      setUrlError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setUrlError(null)

    usersService
      .getInvestorKycDocuments(investorId)
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          setDocuments(
            list.map((d) => ({
              label: KYC_DOCUMENT_LABELS[d.document_type] || d.document_type || "Document",
              url: d.url || d.signed_url,
              document_type: d.document_type,
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
  }, [isOpen, investorId])

  const title = investorName ? `KYC Documents – ${investorName}` : "KYC Documents"

  return (
    <DocumentPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      documents={documents}
      loading={loading}
      error={urlError}
      emptyMessage="No KYC documents available."
    />
  )
}

export default KYCDocumentsModal
