// API Endpoints constants (Admin module)

export const endpoints = {
rmReport: {
  report: "/api/rm/report",
   payout: "/api/rm/payout",
  subUsers: "/api/rm/sub-users",
  partners: "/api/rm/partners",
  investor: "/api/rm/investors",
  visit:"/api/rm/visits"
},
  // partners: {
  //   list: "/api/admin/partners",
  //   get: (partnerId) => `/api/admin/partners/${partnerId}`,
  // },
  // users: {
    // rms: "/api/users/rms",
    // rm: (id) => `/api/users/rms/${id}`,
    // partners: "/api/users/partners",
    // partner: (id) => `/api/users/partners/${id}`,
    // investors: "/api/users/investors",
    // investor: (id) => `/api/users/investors/${id}`,
  // },
 
   
  commissions: { list: "/api/admin/commissions" },
  
  dashboard: {
    base: "/api/rm/report",
    summary: "/api/admin/dashboard/summary",
    pendingKyc: "/api/admin/dashboard/pending-kyc",
    commissionStats: "/api/admin/dashboard/commission-stats",
    investmentVolume: "/api/admin/dashboard/investment-volume",
    userGrowth: "/api/admin/dashboard/user-growth",
    investmentByPlan: "/api/admin/dashboard/investment-by-plan",
    installmentSummary: "/api/admin/dashboard/installment-summary",
  },
  
}
