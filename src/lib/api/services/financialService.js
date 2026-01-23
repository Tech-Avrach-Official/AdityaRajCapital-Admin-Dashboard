// Financial Service - Mock implementation

import {
  mockInvestments,
  mockPayouts,
  mockCommissions,
} from "@/lib/mockData"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const financialService = {
  // Investments
  async getInvestments(params = {}) {
    await delay(500)
    let data = [...mockInvestments]

    if (params.status) {
      data = data.filter((inv) => inv.status === params.status)
    }

    if (params.productId) {
      data = data.filter((inv) => inv.productId === params.productId)
    }

    if (params.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (inv) =>
          inv.investorName.toLowerCase().includes(search) ||
          inv.id.toLowerCase().includes(search) ||
          inv.productName.toLowerCase().includes(search)
      )
    }

    return {
      data,
      total: data.length,
    }
  },

  async getInvestment(id) {
    await delay(300)
    return mockInvestments.find((inv) => inv.id === id) || null
  },

  // Payouts
  async getPayouts(params = {}) {
    await delay(500)
    let data = [...mockPayouts]

    if (params.status) {
      data = data.filter((p) => p.status === params.status)
    }

    if (params.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (p) =>
          p.investorName.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search)
      )
    }

    return {
      data,
      total: data.length,
    }
  },

  async getPayout(id) {
    await delay(300)
    return mockPayouts.find((p) => p.id === id) || null
  },

  async uploadBankPDF(file) {
    await delay(2000) // Simulate PDF processing
    // Mock extracted data
    return {
      success: true,
      extractedData: {
        crnNumbers: ["CRN-20250110-001", "CRN-20250115-002"],
        matchedPayouts: 2,
        unmatchedEntries: 0,
      },
    }
  },

  // Commissions
  async getCommissions(params = {}) {
    await delay(500)
    let data = [...mockCommissions]

    if (params.status) {
      data = data.filter((c) => c.status === params.status)
    }

    if (params.partnerId) {
      data = data.filter((c) => c.partnerId === params.partnerId)
    }

    return {
      data,
      total: data.length,
    }
  },

  async getCommission(id) {
    await delay(300)
    return mockCommissions.find((c) => c.id === id) || null
  },
}
