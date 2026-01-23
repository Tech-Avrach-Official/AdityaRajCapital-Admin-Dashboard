// KYC Service - Mock implementation

import { mockKYC } from "@/lib/mockData/kyc"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const kycService = {
  async getKYCList(params = {}) {
    await delay(500)
    let data = [...mockKYC]

    if (params.status) {
      data = data.filter((kyc) => kyc.status === params.status)
    }

    if (params.role) {
      data = data.filter((kyc) => kyc.role === params.role)
    }

    if (params.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (kyc) =>
          kyc.userName.toLowerCase().includes(search) ||
          kyc.email.toLowerCase().includes(search)
      )
    }

    return {
      data,
      total: data.length,
    }
  },

  async getKYCDetail(id) {
    await delay(300)
    return mockKYC.find((kyc) => kyc.id === id) || null
  },

  async verifyKYC(id) {
    await delay(800)
    const kyc = mockKYC.find((k) => k.id === id)
    if (kyc) {
      kyc.status = "verified"
      kyc.verifiedDate = new Date().toISOString()
      kyc.verifiedBy = "admin-001"
      return kyc
    }
    throw new Error("KYC not found")
  },

  async rejectKYC(id, reason) {
    await delay(800)
    const kyc = mockKYC.find((k) => k.id === id)
    if (kyc) {
      kyc.status = "rejected"
      kyc.rejectedDate = new Date().toISOString()
      kyc.rejectedBy = "admin-001"
      kyc.rejectionReason = reason
      return kyc
    }
    throw new Error("KYC not found")
  },
}
