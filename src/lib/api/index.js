/**
 * Backward-compat re-exports from admin module.
 * New code should use @/modules/admin/api (client, endpoints, services) directly.
 */
export { adminApiClient as default } from "@/modules/admin/api/client"
export { endpoints } from "@/modules/admin/api/endpoints"
export { usersService } from "@/modules/admin/api/services/usersService"
export { hierarchyService } from "@/modules/admin/api/services/hierarchyService"
export { productsService } from "@/modules/admin/api/services/productsService"
export { plansService } from "@/modules/admin/api/services/plansService"
export { financialService } from "@/modules/admin/api/services/financialService"
export { kycService } from "@/modules/admin/api/services/kycService"
export { dashboardService } from "@/modules/admin/api/services/dashboardService"
export { purchasesService } from "@/modules/admin/api/services/purchasesService"
