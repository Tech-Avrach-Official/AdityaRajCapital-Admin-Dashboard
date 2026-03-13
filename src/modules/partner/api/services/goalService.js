import { partnerApiClient } from "../client"
import { endpoints } from "../endpoints"

function unwrap(res) {
  const data = res?.data
  if (data && data.success === false) {
    throw new Error(data.message || "Request failed")
  }
  return data?.data ?? {}
}

export const goalService = {

  async getCurrentGoals() {
    const data = unwrap(
      await partnerApiClient.get(endpoints.partner.goalsCurrent)
    )

    return {
      goals: data.goals ?? [],
      currentPeriod: data.current_period ?? {}
    }
  },

  async deleteGoal(id) {
    await partnerApiClient.delete(
      endpoints.partner.deleteGoal(id)
    )
    return id
  },

  async updateGoal(payload) {
    const data = unwrap(
      await partnerApiClient.post(
        endpoints.partner.updateGoal,
        payload
      )
    )
    return data
  }

}