import { rmApiClient } from "../client"
const authService = {

  async login(credentials) {

    const res = await rmApiClient.post("/api/rm/login", credentials)

    const data = res?.data
    console.log(data)
    if (!data?.success) {
      throw new Error(data?.message || "Login failed")
    }

    return data.data
  }

}

export default authService
export { authService }