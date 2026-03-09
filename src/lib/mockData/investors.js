// Static mock data for Investor module (list, detail, investment detail)

const MOCK_BRANCHES = [
  { id: "1", name: "Mumbai Central" },
  { id: "2", name: "Delhi NCR" },
  { id: "3", name: "Bangalore" },
]

export const mockBranches = () => MOCK_BRANCHES

export const mockInvestorsList = [
  {
    id: "inv-001",
    client_id: "ARC-INV-2024-001",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    mobile: "+91 98765 43210",
    referral: "Neha Partners (NP001)",
    referral_type: "partner",
    kyc_status: "complete",
    total_invested: 2500000,
    verified_count: 2,
    last_verified: "2025-02-15",
    created: "2024-08-10",
    branch_id: "1",
    branch_name: "Mumbai Central",
  },
  {
    id: "inv-002",
    client_id: "ARC-INV-2024-002",
    name: "Priya Verma",
    email: "priya.verma@example.com",
    mobile: "+91 98765 43211",
    referral: "Direct",
    referral_type: "direct",
    kyc_status: "pending",
    total_invested: 500000,
    verified_count: 0,
    last_verified: null,
    created: "2024-11-20",
    branch_id: "2",
    branch_name: "Delhi NCR",
  },
  {
    id: "inv-003",
    client_id: "ARC-INV-2024-003",
    name: "Amit Patel",
    email: "amit.patel@example.com",
    mobile: "+91 98765 43212",
    referral: "Sunil Associates (SA002)",
    referral_type: "partner",
    kyc_status: "complete",
    total_invested: 5000000,
    verified_count: 3,
    last_verified: "2025-03-01",
    created: "2024-06-05",
    branch_id: "1",
    branch_name: "Mumbai Central",
  },
  {
    id: "inv-004",
    client_id: "ARC-INV-2024-004",
    name: "Kavita Reddy",
    email: "kavita.reddy@example.com",
    mobile: "+91 98765 43213",
    referral: "Direct",
    referral_type: "direct",
    kyc_status: "complete",
    total_invested: 1000000,
    verified_count: 1,
    last_verified: "2025-01-10",
    created: "2024-09-15",
    branch_id: "3",
    branch_name: "Bangalore",
  },
  {
    id: "inv-005",
    client_id: "ARC-INV-2024-005",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    mobile: "+91 98765 43214",
    referral: "Neha Partners (NP001)",
    referral_type: "partner",
    kyc_status: "pending",
    total_invested: 0,
    verified_count: 0,
    last_verified: null,
    created: "2025-02-28",
    branch_id: "2",
    branch_name: "Delhi NCR",
  },
]

// Single investor detail (for detail page) – use id inv-001 as canonical
export const mockInvestorDetail = {
  id: "inv-001",
  client_id: "ARC-INV-2024-001",
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  mobile: "+91 98765 43210",
  status: "active",
  kyc_status: "complete",
  nominees_added: true,
  joined: "2024-08-10",
  referral: "Neha Partners (NP001)",
  referral_code: "NP001",
  created_at: "2024-08-10T10:00:00Z",
  profile: {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    mobile: "+91 98765 43210",
    client_id: "ARC-INV-2024-001",
    referral: "Neha Partners (NP001)",
    created: "2024-08-10",
  },
  kyc: {
    status: "complete",
    aadhaar: {
      name: "Rahul Sharma",
      number: "4521 7834 9012",
      dob: "15 May 1990",
      address: "123 MG Road, Andheri East, Mumbai, Maharashtra 400069",
    },
    pan: { name: "Rahul Sharma", number: "ABCDE1234F" },
    bank: {
      account: "62345678901234",
      ifsc: "HDFC0001234",
      name: "HDFC Bank",
      branch: "Andheri East",
    },
    documents: [
      { type: "Aadhaar Front", label: "Aadhaar (Front)" },
      { type: "Aadhaar Back", label: "Aadhaar (Back)" },
      { type: "PAN", label: "PAN Card" },
      { type: "Cancelled Cheque", label: "Cancelled Cheque" },
    ],
  },
  bank_accounts: [
    {
      id: "ba-1",
      account_number: "62345678901234",
      ifsc: "HDFC0001234",
      bank_name: "HDFC Bank",
      branch: "Andheri East",
      status: "active",
    },
    {
      id: "ba-2",
      account_number: "78901234567890",
      ifsc: "ICIC0002345",
      bank_name: "ICICI Bank",
      branch: "Mumbai Central",
      status: "inactive",
    },
  ],
  nominees: [
    {
      id: "nom-1",
      name: "Sunita Sharma",
      relationship: "Spouse",
      share_percent: 50,
      contact: "+91 98765 43219",
    },
    {
      id: "nom-2",
      name: "Arjun Sharma",
      relationship: "Son",
      share_percent: 50,
      contact: "+91 98765 43218",
    },
  ],
  investments: [
    {
      id: "inv-001",
      investment_id: "INV-2024-001-A",
      plan_name: "Monthly Returns Plus",
      amount: 1500000,
      status: "active",
      initialized_at: "2024-09-01T10:00:00Z",
      payment_verified_at: "2024-09-02T14:30:00Z",
      has_deed: true,
    },
    {
      id: "inv-002",
      investment_id: "INV-2024-001-B",
      plan_name: "Secure Growth Plan",
      amount: 1000000,
      status: "active",
      initialized_at: "2024-10-15T11:00:00Z",
      payment_verified_at: "2024-10-16T09:00:00Z",
      has_deed: true,
    },
  ],
}

// Investment detail (single) – for investment detail page
export const mockInvestmentDetail = {
  id: "inv-001",
  investment_id: "INV-2024-001-A",
  display_id: "INV-2024-001-A",
  plan_name: "Monthly Returns Plus",
  amount: 1500000,
  status: "active",
  investor_id: "inv-001",
  investor_name: "Rahul Sharma",
  investor_client_id: "ARC-INV-2024-001",
  initialized_at: "2024-09-01T10:00:00Z",
  payment_proof_uploaded_at: "2024-09-01T12:00:00Z",
  payment_verified_at: "2024-09-02T14:30:00Z",
  cheque_number: null,
  partner: "Neha Partners (NP001)",
  summary: {
    display_id: "INV-2024-001-A",
    plan_name: "Monthly Returns Plus",
    amount: 1500000,
    status: "active",
    initialized_at: "2024-09-01",
    payment_proof_uploaded_at: "2024-09-01",
    payment_verified_at: "2024-09-02",
    cheque_number: null,
    partner: "Neha Partners (NP001)",
  },
  plan_snapshot: {
    plan_name: "Monthly Returns Plus",
    monthly_return_percent: 1.25,
    maturity_return_percent: 15,
    duration_months: 12,
    min_amount: 100000,
    tenure: "12 months",
  },
  bank_for_investment: {
    account_number: "62345678901234",
    ifsc: "HDFC0001234",
    bank_name: "HDFC Bank",
    branch: "Andheri East",
  },
  nominees: [
    { name: "Sunita Sharma", relationship: "Spouse", share_percent: 50, contact: "+91 98765 43219" },
    { name: "Arjun Sharma", relationship: "Son", share_percent: 50, contact: "+91 98765 43218" },
  ],
  installments: [
    {
      seq: 1,
      period: "Nov 2024",
      payout_window: "1 Nov – 5 Nov 2024",
      gross: 18750,
      tds_percent: 10,
      tds_amount: 1875,
      receivable: 16875,
      status: "paid",
      paid_at: "2024-11-03",
    },
    {
      seq: 2,
      period: "Dec 2024",
      payout_window: "1 Dec – 5 Dec 2024",
      gross: 18750,
      tds_percent: 10,
      tds_amount: 1875,
      receivable: 16875,
      status: "paid",
      paid_at: "2024-12-02",
    },
    {
      seq: 3,
      period: "Jan 2025",
      payout_window: "1 Jan – 5 Jan 2025",
      gross: 18750,
      tds_percent: 10,
      tds_amount: 1875,
      receivable: 16875,
      status: "paid",
      paid_at: "2025-01-04",
    },
    {
      seq: 4,
      period: "Feb 2025",
      payout_window: "1 Feb – 5 Feb 2025",
      gross: 18750,
      tds_percent: 10,
      tds_amount: 1875,
      receivable: 16875,
      status: "pending",
      paid_at: null,
    },
    {
      seq: 5,
      period: "Mar 2025",
      payout_window: "1 Mar – 5 Mar 2025",
      gross: 18750,
      tds_percent: 10,
      tds_amount: 1875,
      receivable: 16875,
      status: "pending",
      paid_at: null,
    },
  ],
  installment_summary: {
    total_gross: 93750,
    total_tds: 9375,
    total_receivable: 84375,
    pending_count: 2,
    paid_count: 3,
    cancelled_count: 0,
  },
  deed_signed: true,
  deed_url: "#",
  payment_proof_uploaded: true,
  payment_proof_url: "#",
  timeline: [
    { label: "Investment initialized", date: "2024-09-01", time: "10:00" },
    { label: "Payment proof uploaded", date: "2024-09-01", time: "12:00" },
    { label: "Payment verified", date: "2024-09-02", time: "14:30" },
    { label: "Deed signed", date: "2024-09-05", time: "11:00" },
    { label: "Active", date: "2024-09-05", time: "11:00" },
  ],
}

// Helper: get investor by id (from list or detail mock)
export function getMockInvestorById(id) {
  const fromList = mockInvestorsList.find((i) => i.id === id || i.client_id === id)
  if (fromList) {
    return {
      ...fromList,
      ...(id === mockInvestorDetail.id ? mockInvestorDetail : {}),
    }
  }
  if (mockInvestorDetail.id === id || mockInvestorDetail.client_id === id) return mockInvestorDetail
  return null
}

// Helper: get investment by investorId + investmentId
export function getMockInvestmentDetail(investorId, investmentId) {
  const inv = mockInvestorDetail.investments.find(
    (i) => (i.id === investmentId || i.investment_id === investmentId) && (investorId === mockInvestorDetail.id || investorId === mockInvestorDetail.client_id)
  )
  if (inv && (investorId === mockInvestorDetail.id || investorId === mockInvestorDetail.client_id))
    return { ...mockInvestmentDetail, id: inv.id, investment_id: inv.investment_id, plan_name: inv.plan_name, amount: inv.amount, status: inv.status }
  return mockInvestmentDetail
}
