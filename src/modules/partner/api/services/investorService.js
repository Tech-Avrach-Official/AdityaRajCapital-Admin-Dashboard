import { partnerApiClient } from "../client"
import { endpoints } from "../endpoints"

function unwrap(res) {
  const data = res?.data
  if (data && data.success === false) {
    throw new Error(data.message || "Request failed")
  }
  return data?.data ?? {}
}

export const investorService = {

  async getInvestors() {

    const data = unwrap(
      await partnerApiClient.get(endpoints.partner.investorSummary)
    )

    const investors = data?.investors ?? []

    const normalized = investors.map((inv) => ({
      ...inv,
      created: inv.created_at,
      total_invested: inv.total_invested_amount ?? 0,
      verified_count: inv.total_verified_count ?? 0,
      last_verified: inv.last_verified_at,
    }))

    return {
      data: normalized,
      total: normalized.length,
    }
  },

   async getInvestorInvestments(investorId) {

    const data = unwrap(
      await partnerApiClient.get(
        endpoints.partner.investorInvestments(investorId)
      )
    )

    return {
      investor_id: data.investor_id,
      investor_name: data.investor_name,
      investor_client_id: data.investor_client_id,
      investor_profile_image: data.investor_profile_image,
      purchases: data.purchases ?? [],
    }

  },

}