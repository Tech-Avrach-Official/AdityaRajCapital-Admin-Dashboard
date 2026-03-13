export const endpoints = {
  partner: {
    commissionSummary: "/api/partner/commission/summary",
    investors: "/api/partner/investors",
    goals: "/api/partner/goals",
    investorSummary: "/api/partner/investors",
    investorInvestments: (id) => `/api/partner/investors/${id}/investments`,
     leaderboard: "/api/partner/leaderboard", // ⭐ NEW
      kycDocuments: "/api/partner/signup/kyc/documents",
        // createGoal: "/api/partner/goals/create",
        // updateGoal: "/api/partner/goals/update",
        // deleteGoal: "/api/partner/goals/delete",
  },
}