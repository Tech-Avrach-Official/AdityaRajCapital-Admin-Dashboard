// Financial Service - Supports both Mock and Real API
// Toggle USE_MOCK_DATA to switch between mock and real API

import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"
import {
  mockInvestments,
  mockPayouts,
  mockCommissions,
} from "@/lib/mockData"

// Toggle for mock vs real API - set to false to use actual backend
const USE_MOCK_DATA = false

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Map purchase status to investment status for UI
const mapPurchaseStatusToInvestment = (status) => {
  if (!status) return "pending"
  const s = status.toLowerCase()
  if (s === "payment_uploaded" || s === "payment_verification") return "pending"
  if (s === "payment_verified") return "active"
  if (s === "payment_failed") return "cancelled"
  return status
}

// Normalize investment from API (snake_case) to UI format (camelCase)
const normalizeInvestment = (inv) => {
  if (!inv) return null
  return {
    ...inv,
    id: inv.id ?? inv.investment_id ?? inv.purchase_id,
    investorId: inv.investor_id ?? inv.investorId,
    investorName: inv.investor_name ?? inv.investorName,
    investorEmail: inv.investor_email ?? inv.investorEmail,
    productId: inv.product_id ?? inv.productId ?? inv.plan_id,
    productName: inv.product_name ?? inv.productName ?? inv.plan_name,
    productType: inv.product_type ?? inv.productType,
    planId: inv.plan_id ?? inv.planId,
    amount: inv.amount ?? 0,
    date: inv.date ?? inv.created_at ?? inv.payment_date ?? inv.initialized_at ?? inv.payment_verified_at,
    status: mapPurchaseStatusToInvestment(inv.status),
    expectedReturns: inv.expected_returns ?? inv.expectedReturns ?? 0,
    nextPayout: inv.next_payout ?? inv.nextPayout ?? null,
    paymentMethod: inv.payment_method ?? inv.paymentMethod,
    transactionId: inv.transaction_id ?? inv.transactionId,
    paymentDate: inv.payment_date ?? inv.paymentDate,
    paymentStatus: inv.payment_status ?? inv.paymentStatus,
  }
}

// Map UI status filter to API purchase status
const mapStatusToApiParam = (status) => {
  if (!status || status === "all") return undefined
  const map = {
    pending: "payment_verification",
    active: "payment_verified",
    completed: "payment_verified",
    cancelled: "payment_failed",
    payment_verification: "payment_verification",
    payment_verified: "payment_verified",
    payment_failed: "payment_failed",
    initialized: "initialized",
  }
  return map[status] ?? status
}

export const financialService = {
  /**
   * Super Admin – Investment list (GET /api/admin/investments)
   * Paginated list with period filter: week | month | custom | overall
   */
  async getInvestmentsList(params = {}) {
    const { period = "overall", from_date, to_date, page = 1, limit = 20 } = params

    if (USE_MOCK_DATA) {
      await delay(500)
      let data = [...mockInvestments]
      const total = data.length
      const total_pages = Math.max(1, Math.ceil(total / limit))
      const start = (page - 1) * limit
      const investments = data.slice(start, start + limit).map((inv) => ({
        id: inv.id,
        investment_display_id: inv.id,
        investor_id: inv.investorId,
        investor: {
          id: inv.investorId,
          client_id: inv.investorId,
          name: inv.investorName,
          email: inv.investorEmail,
          mobile: "",
        },
        plan_id: inv.planId ?? inv.productId,
        plan: { id: inv.planId, name: inv.productName, slug: "" },
        amount: inv.amount,
        status: inv.status,
        created_at: inv.date,
        payment_verified_at: inv.date,
        expected_returns: inv.expectedReturns,
        next_payout: inv.nextPayout ? { receivable_amount: 0 } : null,
        next_payout_date: inv.nextPayout,
      }))
      return {
        investments,
        pagination: { page, limit, total, total_pages },
        filter: { period, from_date: from_date || null, to_date: to_date || null },
      }
    }

    const apiParams = { period, page, limit }
    if (period === "custom" && from_date && to_date) {
      apiParams.from_date = from_date
      apiParams.to_date = to_date
    }
    const response = await apiClient.get(endpoints.investments.list, { params: apiParams })
    const data = response.data?.data ?? response.data
    return {
      investments: data?.investments ?? [],
      pagination: data?.pagination ?? { page: 1, limit: 20, total: 0, total_pages: 0 },
      filter: data?.filter ?? { period, from_date: from_date || null, to_date: to_date || null },
    }
  },

  // Investments - uses GET /api/admin/purchases (all purchases, with optional status filter)
  async getInvestments(params = {}) {
    if (USE_MOCK_DATA) {
      await delay(500)
      let data = [...mockInvestments]

      if (params.status) {
        data = data.filter((inv) => inv.status === params.status)
      }

      if (params.productId) {
        data = data.filter((inv) => inv.productId === params.productId)
      }

      if (params.search) {
        const search = params.search.toLowerCase()
        data = data.filter(
          (inv) =>
            (inv.investorName || "").toLowerCase().includes(search) ||
            String(inv.id || "").toLowerCase().includes(search) ||
            (inv.productName || "").toLowerCase().includes(search)
        )
      }

      return { data, total: data.length }
    }

    try {
      const apiParams = {}
      const statusParam = mapStatusToApiParam(params.status)
      if (statusParam) apiParams.status = statusParam
      if (params.investor_id) apiParams.investor_id = params.investor_id

      const response = await apiClient.get(endpoints.purchases.list, { params: apiParams })
      const resData = response.data?.data ?? response.data
      const purchases = resData?.purchases ?? []
      const total = resData?.count ?? resData?.total ?? purchases.length

      // Normalize purchases to investment format for UI
      const normalizedData = Array.isArray(purchases) ? purchases.map(normalizeInvestment) : []

      // Client-side filter by status/search if API doesn't support it
      let filtered = normalizedData
      if (params.status) {
        filtered = filtered.filter((inv) => inv.status === params.status)
      }
      if (params.search) {
        const search = params.search.toLowerCase()
        filtered = filtered.filter(
          (inv) =>
            (inv.investorName || "").toLowerCase().includes(search) ||
            String(inv.id || "").toLowerCase().includes(search) ||
            (inv.productName || "").toLowerCase().includes(search)
        )
      }

      return { data: filtered, total: filtered.length }
    } catch (error) {
      throw error
    }
  },

  async getInvestment(id) {
    if (USE_MOCK_DATA) {
      await delay(300)
      return mockInvestments.find((inv) => inv.id === id || inv.id === String(id)) || null
    }

    try {
      const { data } = await this.getInvestments({})
      const found = (data || []).find((inv) => inv.id === id || inv.id === String(id))
      return found ? normalizeInvestment(found) : null
    } catch (error) {
      throw error
    }
  },

  /**
   * Super Admin – Payout list (GET /api/admin/payouts)
   * Paginated installments; requires month & year; optional slot (1–10, 11–20, 21–30), status.
   */
  async getPayoutsList(params = {}) {
    const { month, year, slot, status, page = 1, limit = 20 } = params
    if (month == null || year == null) {
      throw new Error("Month and year are required")
    }
    const apiParams = { month, year, page, limit }
    if (slot != null && slot !== "" && slot !== "all") apiParams.slot = slot
    if (status != null && status !== "" && status !== "all") apiParams.status = status

    const response = await apiClient.get(endpoints.payouts.list, { params: apiParams })
    const data = response.data?.data ?? response.data
    return {
      payouts: data?.payouts ?? [],
      pagination: data?.pagination ?? { page: 1, limit: 20, total: 0, total_pages: 0 },
      filter: data?.filter ?? { month, year, slot: slot || null, status: status || null },
    }
  },

  // Payouts (legacy mock)
  async getPayouts(params = {}) {
    await delay(500)
    let data = [...mockPayouts]

    if (params.status) {
      data = data.filter((p) => p.status === params.status)
    }

    if (params.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (p) =>
          p.investorName.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search)
      )
    }

    return {
      data,
      total: data.length,
    }
  },

  async getPayout(id) {
    await delay(300)
    return mockPayouts.find((p) => p.id === id) || null
  },

  async uploadBankPDF(file) {
    await delay(2000) // Simulate PDF processing
    // Mock extracted data
    return {
      success: true,
      extractedData: {
        crnNumbers: ["CRN-20250110-001", "CRN-20250115-002"],
        matchedPayouts: 2,
        unmatchedEntries: 0,
      },
    }
  },

  // Commissions
  async getCommissions(params = {}) {
    await delay(500)
    let data = [...mockCommissions]

    if (params.status) {
      data = data.filter((c) => c.status === params.status)
    }

    if (params.partnerId) {
      data = data.filter((c) => c.partnerId === params.partnerId)
    }

    return {
      data,
      total: data.length,
    }
  },

  async getCommission(id) {
    await delay(300)
    return mockCommissions.find((c) => c.id === id) || null
  },
}
