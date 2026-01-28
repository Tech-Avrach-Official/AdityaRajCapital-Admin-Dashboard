// Users Service - Supports both Mock and Real API
// When backend is ready, set USE_MOCK_DATA to false

import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"
import {
  mockRMs,
  mockPartners,
  mockInvestors,
} from "@/lib/mockData/users"

// Toggle for mock vs real API
const USE_MOCK_DATA = false

// Simulate API delay for mock data
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Generate unique RM code
const generateRMCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "RM-"
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const usersService = {
  // =====================
  // Authentication
  // =====================

  async login(admin_id, password) {
    if (USE_MOCK_DATA) {
      await delay(800)
      // Mock login - accept any credentials for testing
      if (admin_id && password) {
        return {
          success: true,
          message: "Login successful",
          data: {
            token: "mock-token-" + Date.now(),
            admin_id: admin_id,
          },
        }
      }
      throw { message: "Invalid admin ID or password" }
    }

    const response = await apiClient.post(endpoints.admin.login, {
      admin_id,
      password,
    })
    return response.data
  },

  // =====================
  // RM Management
  // =====================

  async getRMs(params = {}) {
    if (USE_MOCK_DATA) {
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
            (rm.phone_number || rm.mobile || "").includes(search) ||
            (rm.rm_code || rm.referralCode || "").toLowerCase().includes(search)
        )
      }

      return {
        data,
        total: data.length,
      }
    }

    const response = await apiClient.get(endpoints.rm.list, { params })
    return {
      data: response.data?.data?.rms || [],
      total: response.data?.data?.count || 0,
    }
  },

  async getRM(id) {
    if (USE_MOCK_DATA) {
      await delay(300)
      return mockRMs.find((rm) => rm.id === id || rm.id === String(id)) || null
    }

    const response = await apiClient.get(endpoints.rm.get(id))
    return response.data?.data || null
  },

  // =====================
  // RM Creation with OTP Flow (Recommended)
  // =====================

  /**
   * Step 1: Initiate RM signup - uploads docs and sends OTPs
   */
  async initiateRMSignup(formData) {
    if (USE_MOCK_DATA) {
      await delay(1000)
      const name = formData.get("name")
      const email = formData.get("email")
      const phone_number = formData.get("phone_number")

      // Check for duplicates
      const emailExists = mockRMs.some((rm) => rm.email === email)
      if (emailExists) {
        throw { message: "Email already exists", status: 400 }
      }

      const phoneExists = mockRMs.some((rm) => rm.phone_number === phone_number)
      if (phoneExists) {
        throw { message: "Phone number already exists", status: 400 }
      }

      // Mock signup request
      const signupRequestId = Date.now()
      return {
        success: true,
        message: "OTPs sent to mobile and email. Please verify to complete RM creation.",
        data: {
          signup_request_id: signupRequestId,
          otp_expires_in_minutes: 10,
          message: "OTPs sent to mobile and email. Please verify to complete RM creation.",
          // Dev only - these would not be returned in production
          mobile_otp: "123456",
          email_otp: "654321",
        },
      }
    }

    const response = await apiClient.post(endpoints.rm.initiate, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  /**
   * Step 2: Verify mobile OTP
   */
  async verifyMobileOtp(signupRequestId, otp) {
    if (USE_MOCK_DATA) {
      await delay(500)
      if (otp === "123456") {
        return {
          success: true,
          message: "Mobile number verified successfully",
          data: {
            signup_request_id: signupRequestId,
            mobile_verified: true,
            email_verified: false,
            both_verified: false,
          },
        }
      }
      throw { message: "Invalid mobile OTP", status: 400 }
    }

    const response = await apiClient.post(endpoints.rm.verifyMobileOtp, {
      signup_request_id: signupRequestId,
      otp,
    })
    return response.data
  },

  /**
   * Step 3: Verify email OTP
   */
  async verifyEmailOtp(signupRequestId, otp) {
    if (USE_MOCK_DATA) {
      await delay(500)
      if (otp === "654321") {
        return {
          success: true,
          message: "Email verified successfully",
          data: {
            signup_request_id: signupRequestId,
            mobile_verified: true,
            email_verified: true,
            both_verified: true,
          },
        }
      }
      throw { message: "Invalid email OTP", status: 400 }
    }

    const response = await apiClient.post(endpoints.rm.verifyEmailOtp, {
      signup_request_id: signupRequestId,
      otp,
    })
    return response.data
  },

  /**
   * Step 4: Complete RM creation after both OTPs verified
   */
  async completeRMSignup(signupRequestId) {
    if (USE_MOCK_DATA) {
      await delay(800)
      const rmCode = generateRMCode()
      const newRM = {
        id: mockRMs.length + 1,
        rm_code: rmCode,
        name: "New RM",
        email: "newrm@example.com",
        phone_number: "9876543210",
        aadhaar_front_image_url: "https://placehold.co/400x250/e2e8f0/64748b?text=Aadhaar+Front",
        pan_image_url: "https://placehold.co/400x250/e2e8f0/64748b?text=PAN+Card",
        status: "active",
        partner_count: 0,
        created_at: new Date().toISOString(),
      }
      mockRMs.push(newRM)
      return {
        success: true,
        message: "RM created successfully",
        data: newRM,
      }
    }

    const response = await apiClient.post(endpoints.rm.complete, {
      signup_request_id: signupRequestId,
    })
    return response.data
  },

  /**
   * Resend mobile OTP (rate limited)
   */
  async resendMobileOtp(signupRequestId) {
    if (USE_MOCK_DATA) {
      await delay(500)
      return {
        success: true,
        message: "Mobile OTP resent successfully",
        data: {
          signup_request_id: signupRequestId,
          otp_expires_in_minutes: 10,
          mobile_otp: "789012", // Dev only
        },
      }
    }

    const response = await apiClient.post(endpoints.rm.resendMobileOtp, {
      signup_request_id: signupRequestId,
    })
    return response.data
  },

  /**
   * Resend email OTP (rate limited)
   */
  async resendEmailOtp(signupRequestId) {
    if (USE_MOCK_DATA) {
      await delay(500)
      return {
        success: true,
        message: "Email OTP resent successfully",
        data: {
          signup_request_id: signupRequestId,
          otp_expires_in_minutes: 10,
          email_otp: "345678", // Dev only
        },
      }
    }

    const response = await apiClient.post(endpoints.rm.resendEmailOtp, {
      signup_request_id: signupRequestId,
    })
    return response.data
  },

  /**
   * Get signup request status
   */
  async getSignupStatus(signupRequestId) {
    if (USE_MOCK_DATA) {
      await delay(300)
      return {
        success: true,
        message: "Signup status retrieved",
        data: {
          signup_request_id: signupRequestId,
          status: "pending",
          mobile_verified: false,
          email_verified: false,
          both_verified: false,
        },
      }
    }

    const response = await apiClient.get(endpoints.rm.signupStatus(signupRequestId))
    return response.data
  },

  // =====================
  // Legacy: Direct RM Creation (Deprecated)
  // =====================

  async createRM(formData) {
    if (USE_MOCK_DATA) {
      await delay(1000)
      // Extract data from FormData
      const name = formData.get("name")
      const email = formData.get("email")
      const phone_number = formData.get("phone_number")
      const password = formData.get("password")

      // Check for duplicates
      const emailExists = mockRMs.some((rm) => rm.email === email)
      if (emailExists) {
        throw { message: "Email already exists", status: 400 }
      }

      const phoneExists = mockRMs.some((rm) => rm.phone_number === phone_number)
      if (phoneExists) {
        throw { message: "Phone number already exists", status: 400 }
      }

      const rmCode = generateRMCode()
      const newRM = {
        id: mockRMs.length + 1,
        rm_code: rmCode,
        name,
        email,
        phone_number,
        aadhaar_front_image: `rms/${mockRMs.length + 1}/aadhaar/front.jpg`,
        pan_image: `rms/${mockRMs.length + 1}/pan/pan.jpg`,
        aadhaar_front_image_url: "https://placehold.co/400x250/e2e8f0/64748b?text=Aadhaar+Front",
        pan_image_url: "https://placehold.co/400x250/e2e8f0/64748b?text=PAN+Card",
        status: "active",
        partner_count: 0,
        totalInvestors: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockRMs.push(newRM)
      return {
        success: true,
        message: "RM created successfully",
        data: newRM,
      }
    }

    const response = await apiClient.post(endpoints.rm.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  async updateRM(id, rmData) {
    if (USE_MOCK_DATA) {
      await delay(600)
      const index = mockRMs.findIndex((rm) => rm.id === id || rm.id === String(id))
      if (index !== -1) {
        mockRMs[index] = {
          ...mockRMs[index],
          ...rmData,
          updated_at: new Date().toISOString(),
        }
        return {
          success: true,
          message: "RM updated successfully",
          data: mockRMs[index],
        }
      }
      throw { message: "RM not found", status: 404 }
    }

    const response = await apiClient.put(endpoints.rm.update(id), rmData)
    return response.data
  },

  async deleteRM(id) {
    if (USE_MOCK_DATA) {
      await delay(500)
      const index = mockRMs.findIndex((rm) => rm.id === id || rm.id === String(id))
      if (index !== -1) {
        const rm = mockRMs[index]
        // Check if RM has partners
        if (rm.partner_count > 0 || rm.partnersCount > 0) {
          throw {
            message: `Cannot delete RM with ${rm.partner_count || rm.partnersCount} linked partner(s). Please reassign partners first.`,
            status: 400,
          }
        }
        mockRMs.splice(index, 1)
        return { success: true, message: "RM deleted successfully" }
      }
      throw { message: "RM not found", status: 404 }
    }

    const response = await apiClient.delete(endpoints.rm.delete(id))
    return response.data
  },

  async validateRMCode(code) {
    if (USE_MOCK_DATA) {
      await delay(300)
      const rm = mockRMs.find(
        (rm) => (rm.rm_code || rm.referralCode) === code && rm.status === "active"
      )
      if (rm) {
        return {
          success: true,
          message: "RM found",
          data: { valid: true, rm_name: rm.name },
        }
      }
      throw { message: "Invalid RM referral code", status: 404 }
    }

    const response = await apiClient.get(endpoints.rm.validateCode(code))
    return response.data
  },

  async getRMPartners(rmId) {
    if (USE_MOCK_DATA) {
      await delay(400)
      const rm = mockRMs.find((r) => r.id === rmId || r.id === String(rmId))
      const partners = mockPartners.filter((p) => p.rm_id === rmId || p.rmId === rmId)
      return {
        success: true,
        data: {
          rm_id: rmId,
          rm_code: rm?.rm_code,
          rm_name: rm?.name,
          partner_count: partners.length,
          partners,
        },
      }
    }

    const response = await apiClient.get(endpoints.rm.partners(rmId))
    return response.data
  },

  // =====================
  // Partner Management
  // =====================

  async getPartners(params = {}) {
    if (USE_MOCK_DATA) {
      await delay(500)
      let data = [...mockPartners]

      if (params.status) {
        data = data.filter((p) => p.status === params.status)
      }

      if (params.rmId) {
        data = data.filter((p) => p.rm_id === params.rmId || p.rmId === params.rmId)
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
    }

    const response = await apiClient.get(endpoints.partners.list, { params })
    return {
      data: response.data?.data?.partners || [],
      total: response.data?.data?.count || 0,
    }
  },

  async getPartner(id) {
    if (USE_MOCK_DATA) {
      await delay(300)
      return mockPartners.find((p) => p.id === id) || null
    }

    // Endpoint TBD
    return null
  },

  async changePartnerRM(partnerId, rmId) {
    if (USE_MOCK_DATA) {
      await delay(600)
      const partnerIndex = mockPartners.findIndex((p) => p.id === partnerId)
      if (partnerIndex === -1) {
        throw { message: "Partner not found", status: 404 }
      }

      const newRM = mockRMs.find((rm) => rm.id === rmId)
      if (!newRM) {
        throw { message: "RM not found", status: 404 }
      }

      if (newRM.status !== "active") {
        throw { message: "RM is not active", status: 400 }
      }

      const partner = mockPartners[partnerIndex]
      const previousRMId = partner.rm_id || partner.rmId

      // Update partner
      mockPartners[partnerIndex] = {
        ...partner,
        rm_id: rmId,
        rmId: rmId,
        rm: {
          rm_id: newRM.id,
          rm_code: newRM.rm_code || newRM.referralCode,
          rm_name: newRM.name,
          rm_status: newRM.status,
        },
        rmName: newRM.name,
      }

      // Update partner counts
      if (previousRMId) {
        const prevRMIndex = mockRMs.findIndex((rm) => rm.id === previousRMId)
        if (prevRMIndex !== -1) {
          mockRMs[prevRMIndex].partner_count = Math.max(0, (mockRMs[prevRMIndex].partner_count || 0) - 1)
          mockRMs[prevRMIndex].partnersCount = mockRMs[prevRMIndex].partner_count
        }
      }

      const newRMIndex = mockRMs.findIndex((rm) => rm.id === rmId)
      if (newRMIndex !== -1) {
        mockRMs[newRMIndex].partner_count = (mockRMs[newRMIndex].partner_count || 0) + 1
        mockRMs[newRMIndex].partnersCount = mockRMs[newRMIndex].partner_count
      }

      return {
        success: true,
        message: "Partner RM updated successfully",
        data: {
          partner_id: partnerId,
          previous_rm_id: previousRMId,
          new_rm_id: rmId,
          new_rm_code: newRM.rm_code || newRM.referralCode,
          new_rm_name: newRM.name,
        },
      }
    }

    const response = await apiClient.patch(endpoints.partners.changeRM(partnerId), {
      rm_id: rmId,
    })
    return response.data
  },

  // =====================
  // Investor Management
  // =====================

  async getInvestors(params = {}) {
    if (USE_MOCK_DATA) {
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
    }

    const response = await apiClient.get(endpoints.users.investors, { params })
    return {
      data: response.data?.data || [],
      total: response.data?.total || 0,
    }
  },

  async getInvestor(id) {
    if (USE_MOCK_DATA) {
      await delay(300)
      return mockInvestors.find((i) => i.id === id) || null
    }

    const response = await apiClient.get(endpoints.users.investor(id))
    return response.data?.data || null
  },
}
