// Mock data for Dashboard (UI-only; APIs to be integrated later)

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
    amount: 13000000,
    trend: 15.8,
    trendLabel: "from last month",
  },
  pendingKYC: {
    count: 8,
  },
  pendingVerification: {
    count: 5,
    subtext: "Purchases awaiting payment approval",
  },
  commissionPaid: {
    amount: 3200000,
    trend: 10.5,
    trendLabel: "from last month",
  },
  payoutsDueThisMonth: {
    count: 12,
    amount: 1850000,
  },
}

/** "Requires attention" strip – e.g. payments to verify, KYC pending */
export const mockRequiresAttention = {
  paymentsToVerify: 5,
  kycPending: 3,
}

/** Hierarchy summary – Nations, States, Branches */
export const mockHierarchySummary = {
  nations: 4,
  states: 18,
  branches: 42,
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

/** Pending KYC verifications – Name, Role, Date, Status */
export const mockPendingKYCList = [
  { id: "kyc1", userName: "Rahul Sharma", role: "Investor", submittedDate: "2025-03-05", status: "pending" },
  { id: "kyc2", userName: "Priya Mehta", role: "Partner", submittedDate: "2025-03-06", status: "pending" },
  { id: "kyc3", userName: "Amit Kumar", role: "Investor", submittedDate: "2025-03-07", status: "pending" },
  { id: "kyc4", userName: "Sneha Patel", role: "Investor", submittedDate: "2025-03-08", status: "pending" },
  { id: "kyc5", userName: "Vikram Singh", role: "Partner", submittedDate: "2025-03-09", status: "pending" },
]

/** Pending payment verification – Investor, Plan, Amount, Date (optional Approve/Reject) */
export const mockPendingPaymentVerificationList = [
  { id: "pv1", investorName: "Rajesh Nair", plan: "Premium Growth", amount: 500000, date: "2025-03-08" },
  { id: "pv2", investorName: "Kavita Desai", plan: "Hybrid Investment", amount: 750000, date: "2025-03-08" },
  { id: "pv3", investorName: "Arun Joshi", plan: "Lump Sum Maturity", amount: 1000000, date: "2025-03-09" },
  { id: "pv4", investorName: "Meera Iyer", plan: "Premium Growth", amount: 250000, date: "2025-03-09" },
  { id: "pv5", investorName: "Suresh Reddy", plan: "Hybrid Investment", amount: 500000, date: "2025-03-09" },
]

/** Recent investments – Investor, Plan, Date, Amount, Status */
export const mockRecentInvestmentsList = [
  { id: "inv1", investorName: "Neha Gupta", plan: "Premium Growth", date: "2025-03-09", amount: 500000, status: "active" },
  { id: "inv2", investorName: "Ravi Verma", plan: "Hybrid Investment", date: "2025-03-08", amount: 750000, status: "pending" },
  { id: "inv3", investorName: "Anita Krishnan", plan: "Lump Sum Maturity", date: "2025-03-08", amount: 1000000, status: "active" },
  { id: "inv4", investorName: "Deepak Rao", plan: "Premium Growth", date: "2025-03-07", amount: 250000, status: "active" },
  { id: "inv5", investorName: "Pooja Nair", plan: "Hybrid Investment", date: "2025-03-06", amount: 500000, status: "active" },
]

/** Upcoming / overdue payouts */
export const mockPayoutsDueList = [
  { id: "po1", investorName: "Rahul Sharma", purchaseRef: "INV-2024-089", payoutDate: "2025-03-15", amount: 125000, status: "due" },
  { id: "po2", investorName: "Priya Mehta", purchaseRef: "INV-2024-092", payoutDate: "2025-03-10", amount: 85000, status: "overdue" },
  { id: "po3", investorName: "Amit Kumar", purchaseRef: "INV-2024-095", payoutDate: "2025-03-18", amount: 150000, status: "due" },
  { id: "po4", investorName: "Sneha Patel", purchaseRef: "INV-2024-088", payoutDate: "2025-03-08", amount: 95000, status: "overdue" },
]
