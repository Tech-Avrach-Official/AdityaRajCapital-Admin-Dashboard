import { createApiClient } from "@/global/api/createApiClient"

export const rmApiClient = createApiClient({
  tokenKey: "rmToken",
  loginPath: "/rm/login",
  keysToClearOn401: ["rmToken", "rmId"],
})
