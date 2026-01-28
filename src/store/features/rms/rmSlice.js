// RM Slice - Relationship Manager state management
// Uses entity adapter for normalized state

import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import {
  fetchRMs,
  fetchRMById,
  createRM,
  updateRM,
  deleteRM,
  validateRMCode,
  fetchRMPartners,
  // OTP Flow thunks
  initiateRMSignup,
  verifyMobileOtp,
  verifyEmailOtp,
  completeRMSignup,
  resendMobileOtp,
  resendEmailOtp,
} from "./rmThunks"

/**
 * Entity adapter for normalized RM state
 * Provides CRUD operations and selectors
 */
const rmsAdapter = createEntityAdapter({
  selectId: (rm) => rm.id,
  sortComparer: (a, b) => {
    // Sort by created_at descending (newest first)
    const dateA = new Date(a.created_at || a.createdDate || 0)
    const dateB = new Date(b.created_at || b.createdDate || 0)
    return dateB - dateA
  },
})

/**
 * Initial OTP signup state
 */
const initialOtpState = {
  signupRequestId: null,
  step: 1, // 1: form, 2: verify mobile, 3: verify email, 4: complete
  mobileVerified: false,
  emailVerified: false,
  bothVerified: false,
  otpExpiresInMinutes: 10,
  // Dev only OTPs (for testing)
  devMobileOtp: null,
  devEmailOtp: null,
  // Loading states
  initiating: false,
  verifyingMobile: false,
  verifyingEmail: false,
  completing: false,
  resendingMobile: false,
  resendingEmail: false,
  // Error
  error: null,
}

/**
 * Initial state with entity adapter
 */
const initialState = rmsAdapter.getInitialState({
  // Selected RM for details/edit
  selectedId: null,
  selectedRM: null,
  
  // RM's partners (when viewing details)
  rmPartners: [],
  rmPartnersLoading: false,
  
  // Loading states
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  
  // Error state
  error: null,
  
  // Filters
  filters: {
    search: "",
    status: "all", // "all" | "active" | "inactive"
  },
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  
  // RM code validation
  codeValidation: {
    loading: false,
    valid: null,
    rmName: null,
    error: null,
  },
  
  // OTP Signup flow state
  otpSignup: { ...initialOtpState },
})

/**
 * RM Slice
 */
const rmSlice = createSlice({
  name: "rms",
  initialState,
  reducers: {
    // Set selected RM
    setSelectedRM: (state, action) => {
      state.selectedId = action.payload?.id || action.payload
      state.selectedRM = action.payload
    },
    
    // Clear selected RM
    clearSelectedRM: (state) => {
      state.selectedId = null
      state.selectedRM = null
      state.rmPartners = []
    },
    
    // Set filters
    setRMFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1 // Reset to first page on filter change
    },
    
    // Clear filters
    clearRMFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    },
    
    // Set pagination
    setRMPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    
    // Clear error
    clearRMError: (state) => {
      state.error = null
    },
    
    // Clear code validation
    clearCodeValidation: (state) => {
      state.codeValidation = initialState.codeValidation
    },
    
    // OTP Signup actions
    setOtpStep: (state, action) => {
      state.otpSignup.step = action.payload
    },
    
    clearOtpSignup: (state) => {
      state.otpSignup = { ...initialOtpState }
    },
    
    clearOtpError: (state) => {
      state.otpSignup.error = null
    },
    
    // Reset state
    resetRMs: () => initialState,
  },
  extraReducers: (builder) => {
    // ============ Fetch RMs ============
    builder
      .addCase(fetchRMs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRMs.fulfilled, (state, action) => {
        state.loading = false
        rmsAdapter.setAll(state, action.payload.data)
        state.pagination.total = action.payload.total
      })
      .addCase(fetchRMs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // ============ Fetch RM By ID ============
    builder
      .addCase(fetchRMById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRMById.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          rmsAdapter.upsertOne(state, action.payload)
          state.selectedRM = action.payload
          state.selectedId = action.payload.id
        }
      })
      .addCase(fetchRMById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // ============ Create RM (Legacy) ============
    builder
      .addCase(createRM.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createRM.fulfilled, (state, action) => {
        state.creating = false
        if (action.payload) {
          rmsAdapter.addOne(state, action.payload)
          state.pagination.total += 1
        }
      })
      .addCase(createRM.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload
      })
    
    // ============ Update RM ============
    builder
      .addCase(updateRM.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateRM.fulfilled, (state, action) => {
        state.updating = false
        if (action.payload) {
          rmsAdapter.upsertOne(state, action.payload)
          if (state.selectedId === action.payload.id) {
            state.selectedRM = action.payload
          }
        }
      })
      .addCase(updateRM.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })
    
    // ============ Delete RM ============
    builder
      .addCase(deleteRM.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteRM.fulfilled, (state, action) => {
        state.deleting = false
        rmsAdapter.removeOne(state, action.payload)
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        if (state.selectedId === action.payload) {
          state.selectedId = null
          state.selectedRM = null
        }
      })
      .addCase(deleteRM.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload
      })
    
    // ============ Validate RM Code ============
    builder
      .addCase(validateRMCode.pending, (state) => {
        state.codeValidation.loading = true
        state.codeValidation.error = null
      })
      .addCase(validateRMCode.fulfilled, (state, action) => {
        state.codeValidation.loading = false
        state.codeValidation.valid = action.payload.valid
        state.codeValidation.rmName = action.payload.rm_name
      })
      .addCase(validateRMCode.rejected, (state, action) => {
        state.codeValidation.loading = false
        state.codeValidation.valid = false
        state.codeValidation.error = action.payload
      })
    
    // ============ Fetch RM Partners ============
    builder
      .addCase(fetchRMPartners.pending, (state) => {
        state.rmPartnersLoading = true
      })
      .addCase(fetchRMPartners.fulfilled, (state, action) => {
        state.rmPartnersLoading = false
        state.rmPartners = action.payload.partners || []
      })
      .addCase(fetchRMPartners.rejected, (state) => {
        state.rmPartnersLoading = false
        state.rmPartners = []
      })
    
    // ============ OTP Flow: Initiate Signup ============
    builder
      .addCase(initiateRMSignup.pending, (state) => {
        state.otpSignup.initiating = true
        state.otpSignup.error = null
      })
      .addCase(initiateRMSignup.fulfilled, (state, action) => {
        state.otpSignup.initiating = false
        state.otpSignup.signupRequestId = action.payload.signup_request_id
        state.otpSignup.otpExpiresInMinutes = action.payload.otp_expires_in_minutes || 10
        state.otpSignup.step = 2 // Move to verify mobile step
        // Store dev OTPs for testing (only in dev mode)
        state.otpSignup.devMobileOtp = action.payload.mobile_otp || null
        state.otpSignup.devEmailOtp = action.payload.email_otp || null
      })
      .addCase(initiateRMSignup.rejected, (state, action) => {
        state.otpSignup.initiating = false
        state.otpSignup.error = action.payload
      })
    
    // ============ OTP Flow: Verify Mobile ============
    builder
      .addCase(verifyMobileOtp.pending, (state) => {
        state.otpSignup.verifyingMobile = true
        state.otpSignup.error = null
      })
      .addCase(verifyMobileOtp.fulfilled, (state, action) => {
        state.otpSignup.verifyingMobile = false
        state.otpSignup.mobileVerified = action.payload.mobile_verified
        state.otpSignup.emailVerified = action.payload.email_verified
        state.otpSignup.bothVerified = action.payload.both_verified
        if (action.payload.mobile_verified) {
          state.otpSignup.step = 3 // Move to verify email step
        }
      })
      .addCase(verifyMobileOtp.rejected, (state, action) => {
        state.otpSignup.verifyingMobile = false
        state.otpSignup.error = action.payload
      })
    
    // ============ OTP Flow: Verify Email ============
    builder
      .addCase(verifyEmailOtp.pending, (state) => {
        state.otpSignup.verifyingEmail = true
        state.otpSignup.error = null
      })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.otpSignup.verifyingEmail = false
        state.otpSignup.mobileVerified = action.payload.mobile_verified
        state.otpSignup.emailVerified = action.payload.email_verified
        state.otpSignup.bothVerified = action.payload.both_verified
        if (action.payload.both_verified) {
          state.otpSignup.step = 4 // Move to complete step
        }
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.otpSignup.verifyingEmail = false
        state.otpSignup.error = action.payload
      })
    
    // ============ OTP Flow: Complete Signup ============
    builder
      .addCase(completeRMSignup.pending, (state) => {
        state.otpSignup.completing = true
        state.otpSignup.error = null
      })
      .addCase(completeRMSignup.fulfilled, (state, action) => {
        state.otpSignup.completing = false
        // Add the new RM to the list
        if (action.payload) {
          rmsAdapter.addOne(state, action.payload)
          state.pagination.total += 1
        }
        // Reset OTP state
        state.otpSignup = { ...initialOtpState }
      })
      .addCase(completeRMSignup.rejected, (state, action) => {
        state.otpSignup.completing = false
        state.otpSignup.error = action.payload
      })
    
    // ============ OTP Flow: Resend Mobile OTP ============
    builder
      .addCase(resendMobileOtp.pending, (state) => {
        state.otpSignup.resendingMobile = true
        state.otpSignup.error = null
      })
      .addCase(resendMobileOtp.fulfilled, (state, action) => {
        state.otpSignup.resendingMobile = false
        state.otpSignup.devMobileOtp = action.payload.mobile_otp || null
      })
      .addCase(resendMobileOtp.rejected, (state, action) => {
        state.otpSignup.resendingMobile = false
        state.otpSignup.error = action.payload
      })
    
    // ============ OTP Flow: Resend Email OTP ============
    builder
      .addCase(resendEmailOtp.pending, (state) => {
        state.otpSignup.resendingEmail = true
        state.otpSignup.error = null
      })
      .addCase(resendEmailOtp.fulfilled, (state, action) => {
        state.otpSignup.resendingEmail = false
        state.otpSignup.devEmailOtp = action.payload.email_otp || null
      })
      .addCase(resendEmailOtp.rejected, (state, action) => {
        state.otpSignup.resendingEmail = false
        state.otpSignup.error = action.payload
      })
  },
})

// Export actions
export const {
  setSelectedRM,
  clearSelectedRM,
  setRMFilters,
  clearRMFilters,
  setRMPagination,
  clearRMError,
  clearCodeValidation,
  setOtpStep,
  clearOtpSignup,
  clearOtpError,
  resetRMs,
} = rmSlice.actions

// Export adapter selectors
export const {
  selectAll: selectAllRMsFromAdapter,
  selectById: selectRMByIdFromAdapter,
  selectIds: selectRMIds,
  selectEntities: selectRMEntities,
  selectTotal: selectRMTotal,
} = rmsAdapter.getSelectors((state) => state.rms)

// Export reducer
export default rmSlice.reducer
