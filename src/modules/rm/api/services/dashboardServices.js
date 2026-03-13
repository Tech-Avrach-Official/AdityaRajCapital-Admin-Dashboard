
import { rmApiClient } from "../client"
import { endpoints } from "../endpoints"

function unwrap(res) {
  const data = res?.data

  if (data && data.success === false) {
    const err = new Error(data.message || "Request failed")
    err.response = res
    throw err
  }

  return data?.data ?? {}
}

const dashboardService = {
  async getReport(period = "overall") {
    const res = await rmApiClient.get(endpoints.rmReport.report, {
      params: { period },
    })

    return unwrap(res)
  },
}

export default dashboardService
export { dashboardService }
