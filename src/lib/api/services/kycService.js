/**
 * KYC Service – List (mock/API), document view (real API per KYC_DOCUMENT_VIEW_APIS.md)
 */

import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"
import { mockKYC } from "@/lib/mockData/kyc"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function unwrap(res) {
  const data = res?.data
  if (data && typeof data.success === "boolean" && !data.success) {
    const err = new Error(data.message || "Request failed")
    err.response = res
    err.data = data
    throw err
  }
  return data?.data ?? data ?? {}
}

/** Document type to display label */
export const KYC_DOCUMENT_LABELS = {
  aadhar_front: "Aadhaar (Front)",
  aadhar_back: "Aadhaar (Back)",
  pan_card: "PAN Card",
  cancelled_cheque: "Cancelled Cheque",
}

/** Map API list item to KYC row shape (id, userName, role, investorId, partnerId, etc.) */
function mapKycListItem(item) {
  const role = (item.type ?? item.role ?? "investor").toLowerCase()
  const id = item.id ?? item.kyc_id
  return {
    id,
    userName: item.name ?? item.user_name ?? item.userName,
    email: item.email ?? "",
    mobile: item.mobile ?? item.phone ?? "",
    role,
    submittedDate: item.created_at ?? item.submitted_at ?? item.submittedDate ?? item.date,
    status: (item.status ?? "pending").toLowerCase(),
    investorId: role === "investor" ? id ?? item.investor_id : item.investor_id ?? null,
    partnerId: role === "partner" ? id ?? item.partner_id : item.partner_id ?? null,
  }
}

export const kycService = {
  /**
   * Fetch KYC list: tries real API first, falls back to mock.
   * - Tries GET /api/kyc with status, limit, search, type (role).
   * - If that fails, tries GET /api/admin/dashboard/pending-kyc for pending/all.
   * - On any API failure, uses mock data with client-side filters.
   */
  async getKYCList(params = {}) {
    const status = params.status
    const limit = Math.min(500, Math.max(1, params.limit ?? 500))
    const search = params.search?.trim()
    const role = params.role !== "all" ? params.role : undefined
    const type = params.type !== "all" ? params.type : undefined

    try {
      const apiParams = { limit }
      if (status) apiParams.status = status
      if (search) apiParams.search = search
      if (role) apiParams.type = role
      if (type) apiParams.type = type

      const res = await apiClient.get(endpoints.kyc.list, { params: apiParams })
      const data = unwrap(res)
      const list = (data.list ?? data.data ?? data ?? [])
      const rows = (Array.isArray(list) ? list : []).map(mapKycListItem)
      return { data: rows, total: rows.length }
    } catch (apiErr) {
      // Try dashboard pending-kyc for pending list (documented in DASHBOARD_FRONTEND_GUIDE)
      if (status === "pending" || !status) {
        try {
          const dashRes = await apiClient.get(endpoints.dashboard.pendingKyc, {
            params: { limit },
          })
          const dashData = unwrap(dashRes)
          const dashList = (dashData.list ?? []).map(mapKycListItem)
          let filtered = dashList
          if (role || type) {
            const r = (role ?? type ?? "").toLowerCase()
            if (r) filtered = filtered.filter((k) => (k.role ?? "").toLowerCase() === r)
          }
          if (search) {
            const s = search.toLowerCase()
            filtered = filtered.filter(
              (k) =>
                (k.userName ?? "").toLowerCase().includes(s) ||
                (k.email ?? "").toLowerCase().includes(s)
            )
          }
          if (params.dateFrom) {
            const from = new Date(params.dateFrom)
            from.setHours(0, 0, 0, 0)
            filtered = filtered.filter((k) => new Date(k.submittedDate ?? 0) >= from)
          }
          if (params.dateTo) {
            const to = new Date(params.dateTo)
            to.setHours(23, 59, 59, 999)
            filtered = filtered.filter((k) => new Date(k.submittedDate ?? 0) <= to)
          }
          return { data: filtered, total: filtered.length }
        } catch {
          // fall through to mock
        }
      }
    }

    // Fallback: mock data with client-side filters
    await delay(300)
    let data = [...mockKYC]
    if (params.status) {
      data = data.filter((kyc) => kyc.status === params.status)
    }
    if (params.role && params.role !== "all") {
      data = data.filter((kyc) => (kyc.role ?? "").toLowerCase() === params.role.toLowerCase())
    }
    if (params.type && params.type !== "all") {
      data = data.filter((kyc) => (kyc.role ?? "").toLowerCase() === params.type.toLowerCase())
    }
    if (params.search) {
      const s = params.search.toLowerCase().trim()
      data = data.filter(
        (kyc) =>
          (kyc.userName ?? "").toLowerCase().includes(s) ||
          (kyc.email ?? "").toLowerCase().includes(s) ||
          (kyc.mobile ?? "").replace(/\s/g, "").includes(s.replace(/\s/g, ""))
      )
    }
    if (params.dateFrom) {
      const from = new Date(params.dateFrom)
      from.setHours(0, 0, 0, 0)
      data = data.filter((kyc) => new Date(kyc.submittedDate ?? 0) >= from)
    }
    if (params.dateTo) {
      const to = new Date(params.dateTo)
      to.setHours(23, 59, 59, 999)
      data = data.filter((kyc) => new Date(kyc.submittedDate ?? 0) <= to)
    }
    return { data, total: data.length }
  },

  async getKYCDetail(id) {
    await delay(300)
    return mockKYC.find((kyc) => kyc.id === id) || null
  },

  /**
   * Admin – fetch investor KYC documents (signed URLs, 1h expiry).
   * GET /api/admin/investors/:investorId/kyc-documents
   */
  async getInvestorKycDocuments(investorId) {
    const data = unwrap(
      await apiClient.get(endpoints.admin.investorKycDocuments(investorId))
    )
    return {
      investor_id: data.investor_id ?? investorId,
      documents: Array.isArray(data.documents) ? data.documents : [],
    }
  },

  /**
   * Admin – fetch partner KYC documents (signed URLs, 1h expiry).
   * GET /api/admin/partners/:partnerId/kyc-documents
   */
  async getPartnerKycDocuments(partnerId) {
    const data = unwrap(
      await apiClient.get(endpoints.admin.partnerKycDocuments(partnerId))
    )
    return {
      partner_id: data.partner_id ?? partnerId,
      documents: Array.isArray(data.documents) ? data.documents : [],
    }
  },

  /**
   * Get KYC documents for a list row: uses role and investorId/partnerId.
   * Returns { documents: [{ document_type, url }] }.
   */
  async getKycDocumentsForRow(row) {
    const role = (row.role ?? row.type ?? "").toLowerCase()
    const investorId = row.investorId ?? row.investor_id ?? (role === "investor" ? row.id : null)
    const partnerId = row.partnerId ?? row.partner_id ?? (role === "partner" ? row.id : null)

    if (role === "investor" && (investorId != null || row.id != null)) {
      const res = await this.getInvestorKycDocuments(investorId ?? row.id)
      return res.documents
    }
    if (role === "partner" && (partnerId != null || row.id != null)) {
      const res = await this.getPartnerKycDocuments(partnerId ?? row.id)
      return res.documents
    }
    return []
  },

  async verifyKYC(id) {
    await delay(800)
    const kyc = mockKYC.find((k) => k.id === id)
    if (kyc) {
      kyc.status = "verified"
      kyc.verifiedDate = new Date().toISOString()
      kyc.verifiedBy = "admin-001"
      return kyc
    }
    throw new Error("KYC not found")
  },

  async rejectKYC(id, reason) {
    await delay(800)
    const kyc = mockKYC.find((k) => k.id === id)
    if (kyc) {
      kyc.status = "rejected"
      kyc.rejectedDate = new Date().toISOString()
      kyc.rejectedBy = "admin-001"
      kyc.rejectionReason = reason
      return kyc
    }
    throw new Error("KYC not found")
  },
}
