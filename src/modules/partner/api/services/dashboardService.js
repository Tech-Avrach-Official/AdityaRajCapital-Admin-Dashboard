import { partnerApiClient } from "../client"
import { endpoints } from "../endpoints"

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

const dashboardService = {
  async getCommissionSummary() {
  const data = unwrap(
    await partnerApiClient.get(endpoints.partner.commissionSummary)
  )

  return {
    totalCommission: Number(data.total_earned ?? 0),
    receivableAfterTDS: Number(data.total_earned_receivable ?? 0),
    pendingCommission: Number(data.total_pending_receivable ?? 0),
  }
},

async getInvestorSummary() {
  const data = unwrap(
    await partnerApiClient.get(endpoints.partner.investors)
  )

  const investors = data.investors ?? []

  const activeInvestors = investors.filter(
    (inv) => inv.status === "active"
  ).length

  const totalInvestedAmount = investors.reduce(
    (sum, inv) => sum + Number(inv.total_invested_amount ?? 0),
    0
  )

  const totalInvestments = investors.reduce(
    (sum, inv) => sum + Number(inv.total_investments_count ?? 0),
    0
  )

  return {
    totalInvestors: Number(data.count ?? 0),
    activeInvestors,
    totalInvestedAmount,
    totalInvestments,
    investors, // ⭐ IMPORTANT
  }
},

async getCommissionHistory(params = {}) {

  const q = new URLSearchParams()

  if (params.limit != null) q.set("limit", String(params.limit))
  if (params.offset != null) q.set("offset", String(params.offset))

  const query = q.toString()

  const data = unwrap(
    await partnerApiClient.get(
      `/api/partner/commission/history${query ? `?${query}` : ""}`
    )
  )

  return {
    list: data.list ?? [],
    pagination: data.pagination ?? { limit: 10, offset: 0 },
  }
}

}

export default dashboardService
export { dashboardService }