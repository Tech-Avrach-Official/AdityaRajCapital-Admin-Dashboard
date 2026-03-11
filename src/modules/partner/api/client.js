import { createApiClient } from "@/global/api/createApiClient"

export const partnerApiClient = createApiClient({
  tokenKey: "partnerToken",
  loginPath: "/partner/login",
  keysToClearOn401: ["partnerToken", "partnerId"],
})
