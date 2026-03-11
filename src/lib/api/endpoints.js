// API Endpoints constants

export const endpoints = {
  // Admin Authentication
  admin: {
    login: "/api/admin/login",
    getInvestor: (investorId) => `/api/admin/investors/${investorId}`,
    investorKycData: (investorId) => `/api/admin/investors/${investorId}/kyc-data`,
    investorKycDocuments: (investorId) => `/api/admin/investors/${investorId}/kyc-documents`,
    investorBankAccounts: (investorId) => `/api/admin/investors/${investorId}/bank-accounts`,
    investorNominees: (investorId) => `/api/admin/investors/${investorId}/nominees`,
    nomineeDocuments: (investorId, nomineeId) =>
      `/api/admin/investors/${investorId}/nominees/${nomineeId}/documents`,
    investorPurchases: (investorId) => `/api/admin/investors/${investorId}/purchases`,
    partnerKycDocuments: (partnerId) => `/api/admin/partners/${partnerId}/kyc-documents`,
  },

  // RM Management (Admin)
  rm: {
    // Legacy direct create (deprecated - use OTP flow instead)
    create: "/api/admin/rm/create",
    
    // OTP Flow endpoints (recommended)
    initiate: "/api/admin/rm/initiate",
    verifyMobileOtp: "/api/admin/rm/verify-mobile-otp",
    verifyEmailOtp: "/api/admin/rm/verify-email-otp",
    complete: "/api/admin/rm/complete",
    resendMobileOtp: "/api/admin/rm/resend-mobile-otp",
    resendEmailOtp: "/api/admin/rm/resend-email-otp",
    signupStatus: (requestId) => `/api/admin/rm/signup-status/${requestId}`,
    
    // Other RM endpoints
    list: "/api/admin/rm/list",
    get: (id) => `/api/admin/rm/${id}`,
    update: (id) => `/api/admin/rm/${id}`,
    delete: (id) => `/api/admin/rm/${id}`,
    validateCode: (code) => `/api/admin/rm/code/${code}`,
    partners: (id) => `/api/admin/rm/${id}/partners`,
    investors: (id) => `/api/admin/rm/${id}/investors`,
    visits: (id) => `/api/admin/rm/${id}/visits`,
    commissionSummary: (id) => `/api/admin/rm/${id}/commission-summary`,
    commissions: (id) => `/api/admin/rm/${id}/commissions`,
  },

  // Partner Management (Admin)
  partners: {
    list: "/api/admin/partners",
    get: (partnerId) => `/api/admin/partners/${partnerId}`,
    changeRM: (partnerId) => `/api/admin/partners/${partnerId}/rm`,
  },

  // Legacy endpoints (keeping for backward compatibility)
  // Users
  users: {
    rms: "/api/users/rms",
    rm: (id) => `/api/users/rms/${id}`,
    partners: "/api/users/partners",
    partner: (id) => `/api/users/partners/${id}`,
    investors: "/api/users/investors",
    investor: (id) => `/api/users/investors/${id}`,
  },

  // Products (legacy)
  products: {
    list: "/api/products",
    detail: (id) => `/api/products/${id}`,
    commission: (id) => `/api/products/${id}/commission`,
  },

  // Plans (Admin – full CRUD)
  plans: {
    list: "/api/admin/plans",
    get: (id) => `/api/admin/plans/${id}`,
    create: "/api/admin/plans",
    update: (id) => `/api/admin/plans/${id}`,
    delete: (id) => `/api/admin/plans/${id}`,
  },

  // Financial
  // Note: /api/financial/investments does NOT exist (404). Use purchases.pendingVerification instead.
  financial: {
    payouts: "/api/financial/payouts",
    payout: (id) => `/api/financial/payouts/${id}`,
    uploadPdf: "/api/financial/payouts/upload-pdf",
    commissions: "/api/financial/commissions",
    commission: (id) => `/api/financial/commissions/${id}`,
  },

  // Super Admin – Payout list (installments)
  payouts: {
    list: "/api/admin/payouts",
  },

  // Super Admin – Commission payout list
  commissions: {
    list: "/api/admin/commissions",
  },

  // KYC
  kyc: {
    list: "/api/kyc",
    detail: (id) => `/api/kyc/${id}`,
    verify: (id) => `/api/kyc/${id}/verify`,
    reject: (id) => `/api/kyc/${id}/reject`,
  },

  // Dashboard – see docs/DASHBOARD_FRONTEND_GUIDE.md
  dashboard: {
    base: "/api/admin/dashboard",
    summary: "/api/admin/dashboard/summary",
    pendingKyc: "/api/admin/dashboard/pending-kyc",
    commissionStats: "/api/admin/dashboard/commission-stats",
    investmentVolume: "/api/admin/dashboard/investment-volume",
    userGrowth: "/api/admin/dashboard/user-growth",
    investmentByPlan: "/api/admin/dashboard/investment-by-plan",
    installmentSummary: "/api/admin/dashboard/installment-summary",
  },

  // Settings
  settings: {
    payoutPhases: "/api/settings/payout-phases",
    system: "/api/settings/system",
    templates: "/api/settings/templates",
    tds: "/api/admin/settings/tds",
  },

  // Audit
  audit: {
    logs: "/api/audit/logs",
    export: "/api/audit/export",
  },

  // Hierarchy (Nation → State → Branch) - see docs/HIERARCHY_FRONTEND_GUIDE.md
  hierarchy: {
    nations: {
      list: "/api/admin/nations",
      get: (id) => `/api/admin/nations/${id}`,
      create: "/api/admin/nations",
      update: (id) => `/api/admin/nations/${id}`,
      delete: (id) => `/api/admin/nations/${id}`,
    },
    states: {
      list: "/api/admin/states",
      get: (id) => `/api/admin/states/${id}`,
      assignNation: (id) => `/api/admin/states/${id}/nation`,
    },
    branches: {
      list: "/api/admin/branches",
      get: (id) => `/api/admin/branches/${id}`,
      create: "/api/admin/branches",
      update: (id) => `/api/admin/branches/${id}`,
      delete: (id) => `/api/admin/branches/${id}`,
    },
  },

  // Super Admin – Investment list (all plan purchases with period filter)
  investments: {
    list: "/api/admin/investments",
  },

  // Purchases (Payment Verification) - see docs/INVESTOR_MODULE_FRONTEND_GUIDE.md
  purchases: {
    list: "/api/admin/purchases",
    stats: "/api/admin/purchases/stats",
    pendingVerification: "/api/admin/purchases/pending-verification",
    get: (id) => `/api/admin/purchases/${id}`,
    paymentProofUrl: (id) => `/api/admin/purchases/${id}/payment-proof-url`,
    signedDeedUrl: (id) => `/api/admin/purchases/${id}/signed-deed-url`,
    installments: (id) => `/api/admin/purchases/${id}/installments`,
    verifyPayment: (id) => `/api/admin/purchases/${id}/verify-payment`,
    rejectPayment: (id) => `/api/admin/purchases/${id}/reject-payment`,
  },

  // Investor plans (catalog - no auth)
  investorPlans: "/api/investor/plans",
}
