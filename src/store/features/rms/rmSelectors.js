// RM Selectors - Memoized selectors for RM state
// Provides efficient access to RM data in components

import { createSelector } from "@reduxjs/toolkit"
import {
  selectAllRMsFromAdapter,
  selectRMByIdFromAdapter,
  selectRMEntities,
} from "./rmSlice"

/**
 * Base selector - gets rms slice
 */
const selectRMState = (state) => state.rms

/**
 * Select all RMs as array
 */
export const selectAllRMs = selectAllRMsFromAdapter

/**
 * Select RM by ID
 */
export const selectRMById = (id) => (state) => selectRMByIdFromAdapter(state, id)

/**
 * Select loading state
 */
export const selectRMsLoading = createSelector(
  [selectRMState],
  (rms) => rms.loading
)

/**
 * Select creating state
 */
export const selectRMCreating = createSelector(
  [selectRMState],
  (rms) => rms.creating
)

/**
 * Select updating state
 */
export const selectRMUpdating = createSelector(
  [selectRMState],
  (rms) => rms.updating
)

/**
 * Select deleting state
 */
export const selectRMDeleting = createSelector(
  [selectRMState],
  (rms) => rms.deleting
)

/**
 * Select any operation in progress
 */
export const selectRMOperationInProgress = createSelector(
  [selectRMState],
  (rms) => rms.loading || rms.creating || rms.updating || rms.deleting
)

/**
 * Select error
 */
export const selectRMsError = createSelector(
  [selectRMState],
  (rms) => rms.error
)

/**
 * Select filters
 */
export const selectRMFilters = createSelector(
  [selectRMState],
  (rms) => rms.filters
)

/**
 * Select pagination
 */
export const selectRMPagination = createSelector(
  [selectRMState],
  (rms) => rms.pagination
)

/**
 * Select selected RM
 */
export const selectSelectedRM = createSelector(
  [selectRMState],
  (rms) => rms.selectedRM
)

/**
 * Select selected RM ID
 */
export const selectSelectedRMId = createSelector(
  [selectRMState],
  (rms) => rms.selectedId
)

/**
 * Select RM partners (for selected RM)
 */
export const selectRMPartners = createSelector(
  [selectRMState],
  (rms) => rms.rmPartners
)

/**
 * Select RM partners loading
 */
export const selectRMPartnersLoading = createSelector(
  [selectRMState],
  (rms) => rms.rmPartnersLoading
)

/**
 * Select code validation state
 */
export const selectCodeValidation = createSelector(
  [selectRMState],
  (rms) => rms.codeValidation
)

/**
 * Select filtered RMs based on current filters
 * This is computed on the client side for quick filtering
 */
export const selectFilteredRMs = createSelector(
  [selectAllRMsFromAdapter, selectRMFilters],
  (rms, filters) => {
    let filtered = [...rms]
    
    // Filter by status
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((rm) => rm.status === filters.status)
    }
    
    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (rm) =>
          rm.name?.toLowerCase().includes(search) ||
          rm.email?.toLowerCase().includes(search) ||
          (rm.phone_number || rm.mobile || "").includes(search) ||
          (rm.rm_code || rm.referralCode || "").toLowerCase().includes(search)
      )
    }
    
    return filtered
  }
)

/**
 * Select only active RMs
 */
export const selectActiveRMs = createSelector(
  [selectAllRMsFromAdapter],
  (rms) => rms.filter((rm) => rm.status === "active")
)

/**
 * Select RMs count
 */
export const selectRMsCount = createSelector(
  [selectRMState],
  (rms) => rms.pagination.total
)

/**
 * Select RMs as options (for dropdowns)
 */
export const selectRMOptions = createSelector(
  [selectActiveRMs],
  (rms) =>
    rms.map((rm) => ({
      value: rm.id,
      label: `${rm.name} (${rm.rm_code || rm.referralCode})`,
      rm,
    }))
)

// =====================
// OTP Signup Selectors
// =====================

/**
 * Select OTP signup state
 */
export const selectOtpSignup = createSelector(
  [selectRMState],
  (rms) => rms.otpSignup
)

/**
 * Select OTP signup step
 */
export const selectOtpStep = createSelector(
  [selectOtpSignup],
  (otp) => otp.step
)

/**
 * Select signup request ID
 */
export const selectSignupRequestId = createSelector(
  [selectOtpSignup],
  (otp) => otp.signupRequestId
)

/**
 * Select OTP verification status
 */
export const selectOtpVerificationStatus = createSelector(
  [selectOtpSignup],
  (otp) => ({
    mobileVerified: otp.mobileVerified,
    emailVerified: otp.emailVerified,
    bothVerified: otp.bothVerified,
  })
)

/**
 * Select OTP loading states
 */
export const selectOtpLoading = createSelector(
  [selectOtpSignup],
  (otp) => ({
    initiating: otp.initiating,
    verifyingMobile: otp.verifyingMobile,
    verifyingEmail: otp.verifyingEmail,
    completing: otp.completing,
    resendingMobile: otp.resendingMobile,
    resendingEmail: otp.resendingEmail,
    anyLoading: otp.initiating || otp.verifyingMobile || otp.verifyingEmail || otp.completing,
  })
)

/**
 * Select OTP error
 */
export const selectOtpError = createSelector(
  [selectOtpSignup],
  (otp) => otp.error
)

/**
 * Select dev OTPs (for testing)
 */
export const selectDevOtps = createSelector(
  [selectOtpSignup],
  (otp) => ({
    mobile: otp.devMobileOtp,
    email: otp.devEmailOtp,
  })
)
