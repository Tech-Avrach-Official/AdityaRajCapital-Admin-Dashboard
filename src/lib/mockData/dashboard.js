// Mock data for Dashboard

export const mockDashboardMetrics = {
  totalUsers: {
    count: 145,
    trend: 12.5,
    trendLabel: "from last month",
  },
  totalInvestments: {
    count: 88,
    amount: 53000000,
    trend: 8.3,
    trendLabel: "from last month",
  },
  activeInvestments: {
    count: 75,
    amount: 45000000,
    trend: 5.2,
    trendLabel: "from last month",
  },
  totalRevenue: {
    amount: 12500000,
    trend: 15.8,
    trendLabel: "from last month",
  },
  pendingKYC: {
    count: 8,
  },
  commissionPayouts: {
    amount: 3200000,
    trend: 10.5,
    trendLabel: "from last month",
  },
}

export const mockInvestmentVolumeData = [
  { date: "2024-07", amount: 4500000 },
  { date: "2024-08", amount: 5200000 },
  { date: "2024-09", amount: 4800000 },
  { date: "2024-10", amount: 6100000 },
  { date: "2024-11", amount: 5800000 },
  { date: "2024-12", amount: 6700000 },
  { date: "2025-01", amount: 7200000 },
]

export const mockUserGrowthData = [
  { month: "2024-07", rm: 5, partner: 12, investor: 45 },
  { month: "2024-08", rm: 6, partner: 15, investor: 58 },
  { month: "2024-09", rm: 6, partner: 18, investor: 72 },
  { month: "2024-10", rm: 7, partner: 22, investor: 88 },
  { month: "2024-11", rm: 7, partner: 25, investor: 105 },
  { month: "2024-12", rm: 8, partner: 28, investor: 125 },
  { month: "2025-01", rm: 8, partner: 32, investor: 145 },
]

export const mockInvestmentDistribution = [
  { name: "Premium Growth Plan", value: 12500000, percentage: 23.6 },
  { name: "Hybrid Investment Plan", value: 18500000, percentage: 34.9 },
  { name: "Lump Sum Maturity Plan", value: 22000000, percentage: 41.5 },
]

export const mockCommissionTrends = [
  { date: "2024-07", amount: 280000 },
  { date: "2024-08", amount: 320000 },
  { date: "2024-09", amount: 295000 },
  { date: "2024-10", amount: 380000 },
  { date: "2024-11", amount: 350000 },
  { date: "2024-12", amount: 420000 },
  { date: "2025-01", amount: 450000 },
]
