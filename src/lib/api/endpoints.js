// API Endpoints constants

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

export const endpoints = {
  // Auth
  auth: {
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/auth/logout`,
    refresh: `${BASE_URL}/auth/refresh`,
  },

  // Users
  users: {
    rms: `${BASE_URL}/users/rms`,
    rm: (id) => `${BASE_URL}/users/rms/${id}`,
    partners: `${BASE_URL}/users/partners`,
    partner: (id) => `${BASE_URL}/users/partners/${id}`,
    investors: `${BASE_URL}/users/investors`,
    investor: (id) => `${BASE_URL}/users/investors/${id}`,
  },

  // Products
  products: {
    list: `${BASE_URL}/products`,
    detail: (id) => `${BASE_URL}/products/${id}`,
    commission: (id) => `${BASE_URL}/products/${id}/commission`,
  },

  // Financial
  financial: {
    investments: `${BASE_URL}/financial/investments`,
    investment: (id) => `${BASE_URL}/financial/investments/${id}`,
    payouts: `${BASE_URL}/financial/payouts`,
    payout: (id) => `${BASE_URL}/financial/payouts/${id}`,
    uploadPdf: `${BASE_URL}/financial/payouts/upload-pdf`,
    commissions: `${BASE_URL}/financial/commissions`,
    commission: (id) => `${BASE_URL}/financial/commissions/${id}`,
  },

  // KYC
  kyc: {
    list: `${BASE_URL}/kyc`,
    detail: (id) => `${BASE_URL}/kyc/${id}`,
    verify: (id) => `${BASE_URL}/kyc/${id}/verify`,
    reject: (id) => `${BASE_URL}/kyc/${id}/reject`,
  },

  // Dashboard
  dashboard: {
    metrics: `${BASE_URL}/dashboard/metrics`,
    charts: `${BASE_URL}/dashboard/charts`,
  },

  // Settings
  settings: {
    payoutPhases: `${BASE_URL}/settings/payout-phases`,
    system: `${BASE_URL}/settings/system`,
    templates: `${BASE_URL}/settings/templates`,
  },

  // Audit
  audit: {
    logs: `${BASE_URL}/audit/logs`,
    export: `${BASE_URL}/audit/export`,
  },
}
