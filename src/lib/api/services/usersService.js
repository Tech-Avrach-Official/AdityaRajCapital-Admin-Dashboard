// Users Service - Mock implementation
// Replace with actual API calls when backend is ready

import {
  mockRMs,
  mockPartners,
  mockInvestors,
} from "@/lib/mockData/users"

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const usersService = {
  // RMs
  async getRMs(params = {}) {
    await delay(500)
    let data = [...mockRMs]

    // Filter by status
    if (params.status) {
      data = data.filter((rm) => rm.status === params.status)
    }

    // Search
    if (params.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (rm) =>
          rm.name.toLowerCase().includes(search) ||
          rm.email.toLowerCase().includes(search) ||
          rm.mobile.includes(search) ||
          rm.referralCode.toLowerCase().includes(search)
      )
    }

    return {
      data,
      total: data.length,
    }
  },

  async getRM(id) {
    await delay(300)
    return mockRMs.find((rm) => rm.id === id) || null
  },

  async createRM(rmData) {
    await delay(800)
    const newRM = {
      id: `rm-${String(mockRMs.length + 1).padStart(3, "0")}`,
      ...rmData,
      referralCode: `RM-${rmData.name.substring(0, 2).toUpperCase()}${String(mockRMs.length + 1).padStart(3, "0")}`,
      partnersCount: 0,
      totalInvestors: 0,
      createdDate: new Date().toISOString().split("T")[0],
      lastLogin: null,
    }
    mockRMs.push(newRM)
    return newRM
  },

  async updateRM(id, rmData) {
    await delay(600)
    const index = mockRMs.findIndex((rm) => rm.id === id)
    if (index !== -1) {
      mockRMs[index] = { ...mockRMs[index], ...rmData }
      return mockRMs[index]
    }
    throw new Error("RM not found")
  },

  async deleteRM(id) {
    await delay(500)
    const index = mockRMs.findIndex((rm) => rm.id === id)
    if (index !== -1) {
      mockRMs.splice(index, 1)
      return { success: true }
    }
    throw new Error("RM not found")
  },

  // Partners
  async getPartners(params = {}) {
    await delay(500)
    let data = [...mockPartners]

    if (params.status) {
      data = data.filter((p) => p.status === params.status)
    }

    if (params.rmId) {
      data = data.filter((p) => p.rmId === params.rmId)
    }

    if (params.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search) ||
          p.partnerId.toLowerCase().includes(search)
      )
    }

    return {
      data,
      total: data.length,
    }
  },

  async getPartner(id) {
    await delay(300)
    return mockPartners.find((p) => p.id === id) || null
  },

  // Investors
  async getInvestors(params = {}) {
    await delay(500)
    let data = [...mockInvestors]

    if (params.kycStatus) {
      data = data.filter((i) => i.kycStatus === params.kycStatus)
    }

    if (params.partnerId) {
      data = data.filter((i) => i.partnerId === params.partnerId)
    }

    if (params.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.email.toLowerCase().includes(search) ||
          i.investorId.toLowerCase().includes(search)
      )
    }

    return {
      data,
      total: data.length,
    }
  },

  async getInvestor(id) {
    await delay(300)
    return mockInvestors.find((i) => i.id === id) || null
  },
}
