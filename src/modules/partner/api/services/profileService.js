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

const profileService = {

  async getKycDocuments() {

    const data = unwrap(
      await partnerApiClient.get(endpoints.partner.kycDocuments)
    )

    return data.documents ?? []

  }

}

export default profileService
export { profileService }