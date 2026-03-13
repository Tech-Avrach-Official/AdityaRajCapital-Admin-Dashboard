import { rmApiClient } from "../client"
import { endpoints } from "../endpoints"

function unwrap(res) {
  const data = res?.data

  if (data && data.success === false) {
    throw new Error(data.message || "Request failed")
  }

  return data?.data ?? {}
}

export const subUsers = {
  async getSubUsers() {
    const res = await rmApiClient.get(endpoints.rmReport.subUsers)

    return unwrap(res)
  },
   async getPartnerDetail(partnerId) {

    const res = await rmApiClient.get(`${endpoints.rmReport.partners}/${partnerId}`)

    return unwrap(res).partner

  },
   async getInvestorDetail(investorId) {

    const res = await rmApiClient.get(`${endpoints.rmReport.investor}/${investorId}`)
    // console.log("Api Response:", res);

    return unwrap(res).investor

  },
   async getInvestorInvestments(investorId) {

    const res = await rmApiClient.get(`${endpoints.rmReport.investor}/${investorId}/investments`)
    // console.log("Api Response:", res);

    return unwrap(res)

  }
}
