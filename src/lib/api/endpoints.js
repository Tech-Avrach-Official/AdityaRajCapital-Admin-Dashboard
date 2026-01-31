// API Endpoints constants

export const endpoints = {
  // Admin Authentication
  admin: {
    login: "/api/admin/login",
    investorKycDocuments: (investorId) => `/api/admin/investors/${investorId}/kyc-documents`,
    investorPurchases: (investorId) => `/api/admin/investors/${investorId}/purchases`,
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
  },

  // Partner Management (Admin)
  partners: {
    list: "/api/admin/partners",
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

  // Products
  products: {
    list: "/api/products",
    detail: (id) => `/api/products/${id}`,
    commission: (id) => `/api/products/${id}/commission`,
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

  // KYC
  kyc: {
    list: "/api/kyc",
    detail: (id) => `/api/kyc/${id}`,
    verify: (id) => `/api/kyc/${id}/verify`,
    reject: (id) => `/api/kyc/${id}/reject`,
  },

  // Dashboard
  dashboard: {
    metrics: "/api/dashboard/metrics",
    charts: "/api/dashboard/charts",
  },

  // Settings
  settings: {
    payoutPhases: "/api/settings/payout-phases",
    system: "/api/settings/system",
    templates: "/api/settings/templates",
  },

  // Audit
  audit: {
    logs: "/api/audit/logs",
    export: "/api/audit/export",
  },

  // Purchases (Payment Verification) - see docs/ADMIN_INVESTORS_INVESTMENTS_IMPLEMENTATION_GUIDE.md
  purchases: {
    list: "/api/admin/purchases",
    stats: "/api/admin/purchases/stats",
    pendingVerification: "/api/admin/purchases/pending-verification",
    get: (id) => `/api/admin/purchases/${id}`,
    paymentProofUrl: (id) => `/api/admin/purchases/${id}/payment-proof-url`,
    verifyPayment: (id) => `/api/admin/purchases/${id}/verify-payment`,
    rejectPayment: (id) => `/api/admin/purchases/${id}/reject-payment`,
  },

  // Investor plans (catalog - no auth)
  investorPlans: "/api/investor/plans",
}
