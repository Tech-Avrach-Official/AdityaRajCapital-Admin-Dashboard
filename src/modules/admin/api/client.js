import { createApiClient } from "@/global/api/createApiClient"

export const adminApiClient = createApiClient({
  tokenKey: "adminToken",
  loginPath: "/admin/login",
  keysToClearOn401: ["adminToken", "adminId"],
})
