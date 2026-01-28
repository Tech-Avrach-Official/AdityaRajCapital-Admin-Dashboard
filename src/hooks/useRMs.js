// useRMs Hook - RM management utilities

import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  selectAllRMs,
  selectRMById,
  selectRMsLoading,
  selectRMCreating,
  selectRMUpdating,
  selectRMDeleting,
  selectRMsError,
  selectRMFilters,
  selectRMPagination,
  selectSelectedRM,
  selectFilteredRMs,
  selectActiveRMs,
  selectRMOptions,
  selectRMPartners,
  selectRMPartnersLoading,
  selectCodeValidation,
  // OTP selectors
  selectOtpSignup,
  selectOtpStep,
  selectSignupRequestId,
  selectOtpVerificationStatus,
  selectOtpLoading,
  selectOtpError,
  selectDevOtps,
} from "@/store/features/rms/rmSelectors"
import {
  fetchRMs,
  fetchRMById,
  createRM,
  updateRM,
  deleteRM,
  validateRMCode,
  fetchRMPartners,
  // OTP thunks
  initiateRMSignup,
  verifyMobileOtp,
  verifyEmailOtp,
  completeRMSignup,
  resendMobileOtp,
  resendEmailOtp,
} from "@/store/features/rms/rmThunks"
import {
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
} from "@/store/features/rms/rmSlice"

/**
 * Custom hook for RM management
 */
export const useRMs = () => {
  const dispatch = useAppDispatch()
  
  // Selectors
  const rms = useAppSelector(selectAllRMs)
  const filteredRMs = useAppSelector(selectFilteredRMs)
  const activeRMs = useAppSelector(selectActiveRMs)
  const rmOptions = useAppSelector(selectRMOptions)
  const selectedRM = useAppSelector(selectSelectedRM)
  const loading = useAppSelector(selectRMsLoading)
  const creating = useAppSelector(selectRMCreating)
  const updating = useAppSelector(selectRMUpdating)
  const deleting = useAppSelector(selectRMDeleting)
  const error = useAppSelector(selectRMsError)
  const filters = useAppSelector(selectRMFilters)
  const pagination = useAppSelector(selectRMPagination)
  const rmPartners = useAppSelector(selectRMPartners)
  const rmPartnersLoading = useAppSelector(selectRMPartnersLoading)
  const codeValidation = useAppSelector(selectCodeValidation)
  
  // OTP selectors
  const otpSignup = useAppSelector(selectOtpSignup)
  const otpStep = useAppSelector(selectOtpStep)
  const signupRequestId = useAppSelector(selectSignupRequestId)
  const otpVerification = useAppSelector(selectOtpVerificationStatus)
  const otpLoading = useAppSelector(selectOtpLoading)
  const otpError = useAppSelector(selectOtpError)
  const devOtps = useAppSelector(selectDevOtps)
  
  // Actions
  const loadRMs = useCallback(
    (params) => dispatch(fetchRMs(params)),
    [dispatch]
  )
  
  const loadRMById = useCallback(
    (id) => dispatch(fetchRMById(id)),
    [dispatch]
  )
  
  const createNewRM = useCallback(
    async (formData) => {
      const result = await dispatch(createRM(formData))
      return result
    },
    [dispatch]
  )
  
  const updateExistingRM = useCallback(
    async (id, data) => {
      const result = await dispatch(updateRM({ id, data }))
      return result
    },
    [dispatch]
  )
  
  const deleteExistingRM = useCallback(
    async (id) => {
      const result = await dispatch(deleteRM(id))
      return result
    },
    [dispatch]
  )
  
  const validateCode = useCallback(
    (code) => dispatch(validateRMCode(code)),
    [dispatch]
  )
  
  const loadRMPartners = useCallback(
    (rmId) => dispatch(fetchRMPartners(rmId)),
    [dispatch]
  )
  
  const selectRM = useCallback(
    (rm) => dispatch(setSelectedRM(rm)),
    [dispatch]
  )
  
  const deselectRM = useCallback(
    () => dispatch(clearSelectedRM()),
    [dispatch]
  )
  
  const updateFilters = useCallback(
    (newFilters) => dispatch(setRMFilters(newFilters)),
    [dispatch]
  )
  
  const resetFilters = useCallback(
    () => dispatch(clearRMFilters()),
    [dispatch]
  )
  
  const updatePagination = useCallback(
    (newPagination) => dispatch(setRMPagination(newPagination)),
    [dispatch]
  )
  
  const clearError = useCallback(
    () => dispatch(clearRMError()),
    [dispatch]
  )
  
  const clearValidation = useCallback(
    () => dispatch(clearCodeValidation()),
    [dispatch]
  )
  
  const reset = useCallback(
    () => dispatch(resetRMs()),
    [dispatch]
  )
  
  // Get RM by ID selector
  const getRMById = useCallback(
    (id) => selectRMById(id),
    []
  )
  
  // =====================
  // OTP Flow Actions
  // =====================
  
  /**
   * Step 1: Initiate RM signup with OTP
   */
  const initiateSignup = useCallback(
    async (formData) => {
      const result = await dispatch(initiateRMSignup(formData))
      return result
    },
    [dispatch]
  )
  
  /**
   * Step 2: Verify mobile OTP
   */
  const verifyMobile = useCallback(
    async (otp) => {
      if (!signupRequestId) {
        return { error: "No signup request ID" }
      }
      const result = await dispatch(verifyMobileOtp({ signupRequestId, otp }))
      return result
    },
    [dispatch, signupRequestId]
  )
  
  /**
   * Step 3: Verify email OTP
   */
  const verifyEmail = useCallback(
    async (otp) => {
      if (!signupRequestId) {
        return { error: "No signup request ID" }
      }
      const result = await dispatch(verifyEmailOtp({ signupRequestId, otp }))
      return result
    },
    [dispatch, signupRequestId]
  )
  
  /**
   * Step 4: Complete RM creation
   */
  const completeSignup = useCallback(
    async () => {
      if (!signupRequestId) {
        return { error: "No signup request ID" }
      }
      const result = await dispatch(completeRMSignup(signupRequestId))
      return result
    },
    [dispatch, signupRequestId]
  )
  
  /**
   * Resend mobile OTP
   */
  const resendMobile = useCallback(
    async () => {
      if (!signupRequestId) {
        return { error: "No signup request ID" }
      }
      const result = await dispatch(resendMobileOtp(signupRequestId))
      return result
    },
    [dispatch, signupRequestId]
  )
  
  /**
   * Resend email OTP
   */
  const resendEmail = useCallback(
    async () => {
      if (!signupRequestId) {
        return { error: "No signup request ID" }
      }
      const result = await dispatch(resendEmailOtp(signupRequestId))
      return result
    },
    [dispatch, signupRequestId]
  )
  
  /**
   * Set OTP step manually
   */
  const goToStep = useCallback(
    (step) => dispatch(setOtpStep(step)),
    [dispatch]
  )
  
  /**
   * Reset OTP signup state
   */
  const resetOtpSignup = useCallback(
    () => dispatch(clearOtpSignup()),
    [dispatch]
  )
  
  /**
   * Clear OTP error
   */
  const clearOtpErrorAction = useCallback(
    () => dispatch(clearOtpError()),
    [dispatch]
  )
  
  return {
    // State
    rms,
    filteredRMs,
    activeRMs,
    rmOptions,
    selectedRM,
    loading,
    creating,
    updating,
    deleting,
    error,
    filters,
    pagination,
    rmPartners,
    rmPartnersLoading,
    codeValidation,
    
    // OTP State
    otpSignup,
    otpStep,
    signupRequestId,
    otpVerification,
    otpLoading,
    otpError,
    devOtps,
    
    // Actions
    loadRMs,
    loadRMById,
    createNewRM,
    updateExistingRM,
    deleteExistingRM,
    validateCode,
    loadRMPartners,
    selectRM,
    deselectRM,
    updateFilters,
    resetFilters,
    updatePagination,
    clearError,
    clearValidation,
    reset,
    getRMById,
    
    // OTP Actions
    initiateSignup,
    verifyMobile,
    verifyEmail,
    completeSignup,
    resendMobile,
    resendEmail,
    goToStep,
    resetOtpSignup,
    clearOtpError: clearOtpErrorAction,
  }
}

export default useRMs
