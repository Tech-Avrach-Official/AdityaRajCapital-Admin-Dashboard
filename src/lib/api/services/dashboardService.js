/**
 * Dashboard Service – Real API implementation
 * See docs/DASHBOARD_FRONTEND_GUIDE.md for API mapping.
 * All requests use apiClient (Authorization: Bearer <token> via interceptor).
 */

import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"

/** UI period (dropdown value) → backend period param */
export const PERIOD_MAP = {
  "7": "last_7_days",
  "30": "last_30_days",
  "90": "last_3_months",
  "180": "last_6_months",
  "365": "this_year",
}

/**
 * Get from_date and to_date for the previous period (same length as current).
 * Used for "% from last month" trend (e.g. last 30 days vs previous 30 days).
 */
export function getPreviousPeriodDates(periodKey) {
  const daysMap = { "7": 7, "30": 30, "90": 90, "180": 180, "365": 365 }
  const days = daysMap[periodKey] ?? 30
  const now = new Date()
  const toDate = new Date(now)
  toDate.setDate(toDate.getDate() - days)
  const fromDate = new Date(toDate)
  fromDate.setDate(fromDate.getDate() - days)
  const fmt = (d) => d.toISOString().slice(0, 10)
  return { from_date: fmt(fromDate), to_date: fmt(toDate) }
}

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

function toParams(periodKey, usePrevious = false) {
  if (usePrevious) {
    const { from_date, to_date } = getPreviousPeriodDates(periodKey)
    return { from_date, to_date }
  }
  const period = PERIOD_MAP[periodKey] ?? "last_30_days"
  return { period }
}

function normalizePurchase(p) {
  const date = p.date ?? p.created_at ?? p.payment_date ?? p.initialized_at ?? p.payment_verified_at
  return {
    id: p.id ?? p.purchase_id,
    investorName: p.investor_name ?? p.investorName,
    plan: p.plan_name ?? p.planName ?? p.product_name ?? p.productName,
    amount: Number(p.amount ?? 0),
    date,
    status: (p.status ?? "pending").toLowerCase().replace("payment_verified", "active").replace("payment_verification", "pending"),
  }
}

const dashboardService = {
  /** GET /api/admin/dashboard/summary – counts, hierarchy, purchase_stats */
  async getSummary() {
    const data = unwrap(await apiClient.get(endpoints.dashboard.summary))
    return {
      counts: data.counts ?? {},
      hierarchy: data.hierarchy ?? {},
      purchase_stats: data.purchase_stats ?? {},
    }
  },

  /** GET /api/admin/dashboard/pending-kyc?limit= */
  async getPendingKyc(limit = 10) {
    const data = unwrap(
      await apiClient.get(endpoints.dashboard.pendingKyc, {
        params: { limit: Math.min(100, Math.max(1, limit)) },
      })
    )
    const list = (data.list ?? []).map((item) => ({
      id: item.id,
      userName: item.name ?? item.user_name ?? item.userName,
      role: (item.type ?? item.role ?? "investor").toLowerCase(),
      submittedDate: item.created_at ?? item.submittedDate ?? item.date,
      status: (item.status ?? "pending").toLowerCase(),
    }))
    return { count: data.count ?? list.length, list }
  },

  /** GET /api/admin/dashboard/commission-stats?period= (or from_date, to_date) */
  async getCommissionStats(periodKey, usePrevious = false) {
    const params = toParams(periodKey, usePrevious)
    const data = unwrap(
      await apiClient.get(endpoints.dashboard.commissionStats, { params })
    )
    const byMonth = (data.by_month ?? data.series ?? []).map((row) => ({
      date: row.period ?? row.date ?? row.month,
      amount: Number(row.amount ?? 0),
    }))
    return {
      total_paid: Number(data.total_paid ?? 0),
      by_month: byMonth,
    }
  },

  /** GET /api/admin/dashboard/investment-volume?period= */
  async getInvestmentVolume(periodKey) {
    const params = toParams(periodKey)
    const data = unwrap(
      await apiClient.get(endpoints.dashboard.investmentVolume, { params })
    )
    const series = (data.series ?? []).map((row) => ({
      date: row.period ?? row.date ?? row.month,
      amount: Number(row.amount ?? 0),
      count: Number(row.count ?? 0),
    }))
    return { series }
  },

  /** GET /api/admin/dashboard/user-growth?period= */
  async getUserGrowth(periodKey) {
    const params = toParams(periodKey)
    const data = unwrap(
      await apiClient.get(endpoints.dashboard.userGrowth, { params })
    )
    const series = (data.series ?? []).map((row) => ({
      month: row.period ?? row.date ?? row.month,
      investors: Number(row.investors ?? 0),
      partners: Number(row.partners ?? 0),
      rms: Number(row.rms ?? 0),
    }))
    return { series }
  },

  /** GET /api/admin/dashboard/investment-by-plan */
  async getInvestmentByPlan() {
    const data = unwrap(await apiClient.get(endpoints.dashboard.investmentByPlan))
    const plans = (data.plans ?? []).map((row) => ({
      plan_id: row.plan_id,
      plan_name: row.plan_name ?? row.name,
      amount: Number(row.amount ?? 0),
      count: Number(row.count ?? 0),
      percentage: Number(row.percentage ?? 0),
    }))
    return { plans }
  },

  /** GET /api/admin/dashboard/installment-summary */
  async getInstallmentSummary() {
    const data = unwrap(await apiClient.get(endpoints.dashboard.installmentSummary))
    return {
      total: Number(data.total ?? 0),
      pending: Number(data.pending ?? 0),
      paid: Number(data.paid ?? 0),
      cancelled: Number(data.cancelled ?? 0),
      total_receivable_pending: Number(data.total_receivable_pending ?? 0),
      due_this_month_count: Number(data.due_this_month_count ?? 0),
      due_this_month_amount: Number(data.due_this_month_amount ?? 0),
    }
  },

  /** GET /api/admin/purchases/pending-verification – for dashboard list */
  async getPendingPaymentVerifications() {
    const data = unwrap(
      await apiClient.get(endpoints.purchases.pendingVerification)
    )
    const purchases = data.purchases ?? data ?? []
    return (Array.isArray(purchases) ? purchases : []).map(normalizePurchase)
  },

  /** GET /api/admin/purchases?limit= – recent purchases for dashboard list */
  async getRecentPurchases(limit = 10) {
    const data = unwrap(
      await apiClient.get(endpoints.purchases.list, {
        params: { limit: Math.min(100, Math.max(1, limit)), offset: 0 },
      })
    )
    const purchases = data.purchases ?? data ?? []
    return (Array.isArray(purchases) ? purchases : []).map(normalizePurchase)
  },
}

export default dashboardService
export { dashboardService }
