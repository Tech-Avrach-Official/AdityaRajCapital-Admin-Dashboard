import { partnerApiClient } from "../client"

const authService = {

  async login(credentials) {

    const res = await partnerApiClient.post("/api/partner/login", credentials)

    const data = res?.data

    if (!data?.success) {
      throw new Error(data?.message || "Login failed")
    }

    return data.data
  }

}

export default authService
export { authService }