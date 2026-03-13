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

const leaderboardService = {
  async getLeaderboard() {
    const data = unwrap(
      await partnerApiClient.get(endpoints.partner.leaderboard)
    )

    return {
      branch: data.branch,
      state: data.state,
      overall: data.overall,
      context: data.context,
    }
  },
}

export default leaderboardService
export { leaderboardService }