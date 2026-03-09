// Purchases Service - Supports both Mock and Real API
// Handles payment verification for investor plan purchases

import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"
import {
  mockPendingPurchases,
  mockVerifiedPurchases,
  mockRejectedPurchases,
} from "@/lib/mockData/purchases"

// Toggle for mock vs real API - set to true for development without backend
const USE_MOCK_DATA = false

// Simulate API delay for mock data
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper to get file type from path
const getFileType = (filePath) => {
  if (!filePath) return "unknown"
  const ext = filePath.split(".").pop()?.toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image"
  if (ext === "pdf") return "pdf"
  return "unknown"
}

// Helper to resolve payment proof URL
const resolvePaymentProofUrl = (purchase) => {
  // If API returns a signed URL, use it directly
  if (purchase.payment_proof_url) {
    return purchase.payment_proof_url
  }

  // If storage base URL is configured, construct the URL
  const storageBaseUrl = import.meta.env.VITE_STORAGE_BASE_URL
  if (storageBaseUrl && purchase.payment_proof_file_path) {
    return `${storageBaseUrl}/${purchase.payment_proof_file_path}`
  }

  // Return null if no URL can be resolved
  return null
}

export const purchasesService = {
  // =====================
  // Get Pending Verifications
  // =====================

  async getPendingVerifications(params = {}) {
    if (USE_MOCK_DATA) {
      await delay(500)

      // Filter out already verified/rejected purchases
      let data = mockPendingPurchases.filter(
        (p) =>
          !mockVerifiedPurchases.includes(p.id) &&
          !mockRejectedPurchases.includes(p.id)
      )

      // Search filter (client-side)
      if (params.search) {
        const search = params.search.toLowerCase()
        data = data.filter(
          (p) =>
            String(p.id).toLowerCase().includes(search) ||
            String(p.investor_id).toLowerCase().includes(search) ||
            p.investor_name?.toLowerCase().includes(search) ||
            p.plan_name?.toLowerCase().includes(search) ||
            String(p.amount).includes(search)
        )
      }

      // Enrich with resolved URLs and file types
      const enrichedData = data.map((purchase) => ({
        ...purchase,
        resolved_payment_proof_url: resolvePaymentProofUrl(purchase),
        payment_proof_file_type: getFileType(purchase.payment_proof_file_path),
      }))

      return {
        data: enrichedData,
        total: enrichedData.length,
      }
    }

    const response = await apiClient.get(endpoints.purchases.pendingVerification, { params })
    
    // Parse response - API returns data.purchases and data.total or data.count
    const resData = response.data?.data ?? response.data
    const purchases = resData?.purchases ?? resData ?? []
    const total = resData?.total ?? resData?.count ?? purchases.length

    // Enrich with resolved URLs and file types (fallback: use payment-proof-url API when viewing)
    const enrichedPurchases = (Array.isArray(purchases) ? purchases : []).map((purchase) => ({
      ...purchase,
      resolved_payment_proof_url: resolvePaymentProofUrl(purchase),
      payment_proof_file_type: getFileType(purchase.payment_proof_file_path),
    }))

    return {
      data: enrichedPurchases,
      total: Array.isArray(purchases) ? total : enrichedPurchases.length,
    }
  },

  // =====================
  // Get single purchase (full detail) - for Investment detail page
  // =====================

  async getPurchase(purchaseId) {
    const response = await apiClient.get(endpoints.purchases.get(purchaseId))
    const data = response.data?.data ?? response.data
    return data ?? null
  },

  // =====================
  // Get Signed Deed URL - for "View deed" on Investor/Investment detail
  // =====================

  async getSignedDeedUrl(purchaseId) {
    const response = await apiClient.get(endpoints.purchases.signedDeedUrl(purchaseId))
    const data = response.data?.data ?? response.data
    return data?.url ?? data?.signed_deed_url ?? null
  },

  // =====================
  // Get Purchase Installments - for Investment detail page
  // =====================

  async getInstallments(purchaseId) {
    const response = await apiClient.get(endpoints.purchases.installments(purchaseId))
    const data = response.data?.data ?? response.data
    return data ?? { installments: [], summary: null }
  },

  // =====================
  // Get Payment Proof URL(s) - signed URLs (API returns data.urls array)
  // =====================

  async getPaymentProofUrl(purchaseId) {
    if (USE_MOCK_DATA) {
      await delay(300)
      const purchase = mockPendingPurchases.find((p) => p.id === purchaseId)
      const url = purchase?.payment_proof_url ?? null
      return { urls: url ? [url] : [], expires_in_seconds: 3600 }
    }

    const response = await apiClient.get(endpoints.purchases.paymentProofUrl(purchaseId))
    const data = response.data?.data ?? {}
    // New API: data.urls = [{ url: "..." }, ...]; legacy: data.url
    const urls = Array.isArray(data.urls)
      ? data.urls.map((u) => (typeof u === "string" ? u : u?.url)).filter(Boolean)
      : data.url
        ? [data.url]
        : []
    return { urls, expires_in_seconds: data.expires_in_seconds ?? 3600 }
  },

  // =====================
  // Verify Payment (Approve) - requires cheque_number in body
  // =====================

  async verifyPayment(purchaseId, { cheque_number } = {}) {
    const trimmedCheque = typeof cheque_number === "string" ? cheque_number.trim() : ""

    if (USE_MOCK_DATA) {
      await delay(600)

      if (!trimmedCheque) {
        throw {
          message: "Cheque number is required when approving payment",
          status: 400,
          error_code: "VAL_001",
        }
      }

      const purchase = mockPendingPurchases.find((p) => p.id === purchaseId)
      if (!purchase) {
        throw { message: "Purchase not found", status: 404, error_code: "PURCHASE_NOT_FOUND" }
      }

      if (mockVerifiedPurchases.includes(purchaseId)) {
        throw {
          message: "Payment has already been verified",
          status: 400,
          error_code: "PURCHASE_INVALID_STATUS",
        }
      }

      if (mockRejectedPurchases.includes(purchaseId)) {
        throw {
          message: "Cannot verify a rejected payment",
          status: 400,
          error_code: "PURCHASE_INVALID_STATUS",
        }
      }

      mockVerifiedPurchases.push(purchaseId)

      return {
        success: true,
        message: "Payment verified successfully",
        data: {
          purchase_id: purchaseId,
          status: "payment_verified",
          payment_verified_at: new Date().toISOString(),
          cheque_number: trimmedCheque,
        },
      }
    }

    const response = await apiClient.post(endpoints.purchases.verifyPayment(purchaseId), {
      cheque_number: trimmedCheque,
    })
    return response.data
  },

  // =====================
  // Reject Payment
  // =====================

  async rejectPayment(purchaseId, { reason } = {}) {
    if (USE_MOCK_DATA) {
      await delay(600)

      const purchase = mockPendingPurchases.find((p) => p.id === purchaseId)
      if (!purchase) {
        throw { message: "Purchase not found", status: 404 }
      }

      if (mockVerifiedPurchases.includes(purchaseId)) {
        throw {
          message: "Cannot reject a verified payment",
          status: 400,
          code: "PURCHASE_INVALID_STATUS",
        }
      }

      if (mockRejectedPurchases.includes(purchaseId)) {
        throw {
          message: "Payment has already been rejected",
          status: 400,
          code: "PURCHASE_INVALID_STATUS",
        }
      }

      // Mark as rejected
      mockRejectedPurchases.push(purchaseId)

      return {
        success: true,
        message: "Payment rejected",
        data: {
          purchase_id: purchaseId,
          status: "payment_failed",
          payment_rejected_at: new Date().toISOString(),
          rejection_reason: reason || null,
        },
      }
    }

    const response = await apiClient.post(endpoints.purchases.rejectPayment(purchaseId), {
      reason,
    })
    return response.data
  },

  // =====================
  // Helper Methods
  // =====================

  /**
   * Get file type from payment proof path
   */
  getFileType,

  /**
   * Resolve payment proof URL from purchase object
   */
  resolvePaymentProofUrl,
}
