// Dashboard Service - Mock implementation

import {
  mockDashboardMetrics,
  mockInvestmentVolumeData,
  mockUserGrowthData,
  mockInvestmentDistribution,
  mockCommissionTrends,
} from "@/lib/mockData/dashboard"
import { mockKYC } from "@/lib/mockData/kyc"
import { mockInvestments } from "@/lib/mockData/investments"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const dashboardService = {
  async getMetrics() {
    await delay(500)
    return mockDashboardMetrics
  },

  async getCharts(params = {}) {
    await delay(500)
    return {
      investmentVolume: mockInvestmentVolumeData,
      userGrowth: mockUserGrowthData,
      investmentDistribution: mockInvestmentDistribution,
      commissionTrends: mockCommissionTrends,
    }
  },

  async getRecentActivity() {
    await delay(500)
    const pendingKYC = mockKYC
      .filter((kyc) => kyc.status === "pending")
      .slice(0, 10)
      .map((kyc) => ({
        id: kyc.id,
        userName: kyc.userName,
        role: kyc.role,
        submittedDate: kyc.submittedDate,
        status: kyc.status,
      }))

    const recentInvestments = mockInvestments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map((inv) => ({
        id: inv.id,
        investorName: inv.investorName,
        productName: inv.productName,
        amount: inv.amount,
        date: inv.date,
        status: inv.status,
      }))

    return {
      pendingKYC,
      recentInvestments,
    }
  },
}
