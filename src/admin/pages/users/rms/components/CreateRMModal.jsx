import React, { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Loader2,
  Info,
  CheckCircle2,
  ArrowLeft,
  Phone,
  Mail,
  RefreshCw,
} from "lucide-react"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImageDropzone from "@/components/common/ImageDropzone"
import { useRMs } from "@/hooks"

// Validation schema for RM creation
const rmSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Email must be a valid email address"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
})

// Step indicator component
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center mb-6">
    {steps.map((step, index) => (
      <div key={step.id} className="flex items-center">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
            index + 1 < currentStep
              ? "bg-green-500 text-white"
              : index + 1 === currentStep
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {index + 1 < currentStep ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            index + 1
          )}
        </div>
        {index < steps.length - 1 && (
          <div
            className={`w-12 h-1 mx-2 rounded ${
              index + 1 < currentStep ? "bg-green-500" : "bg-muted"
            }`}
          />
        )}
      </div>
    ))}
  </div>
)

// OTP Input component
const OTPInput = ({ value, onChange, disabled, length = 6 }) => {
  const inputRefs = useRef([])
  
  // Create a stable array of digits from value
  const getOtpArray = (val) => {
    const arr = (val || "").split("").slice(0, length)
    // Pad with empty strings to always have 'length' elements
    while (arr.length < length) arr.push("")
    return arr
  }
  
  const [otp, setOtp] = useState(() => getOtpArray(value))

  useEffect(() => {
    setOtp(getOtpArray(value))
  }, [value, length])

  const handleChange = (index, e) => {
    const val = e.target.value
    if (!/^\d*$/.test(val)) return

    const newOtp = [...otp]
    newOtp[index] = val.slice(-1)
    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, length)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = getOtpArray(pastedData)
    setOtp(newOtp)
    onChange(newOtp.join(""))
    
    // Focus the next empty field or last field
    const nextEmptyIndex = newOtp.findIndex(d => d === "")
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 text-center text-lg font-semibold"
        />
      ))}
    </div>
  )
}

const CreateRMModal = ({ open, onOpenChange, onSuccess }) => {
  // Form data stored across steps
  const [formData, setFormData] = useState(null)
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null)
  const [panImageFile, setPanImageFile] = useState(null)
  const [fileErrors, setFileErrors] = useState({
    aadhaarFront: "",
    panImage: "",
  })

  // OTP inputs
  const [mobileOtp, setMobileOtp] = useState("")
  const [emailOtp, setEmailOtp] = useState("")

  // Resend cooldown timers
  const [mobileResendTimer, setMobileResendTimer] = useState(0)
  const [emailResendTimer, setEmailResendTimer] = useState(0)

  // Redux hook
  const {
    otpStep,
    otpLoading,
    otpError,
    otpVerification,
    devOtps,
    initiateSignup,
    verifyMobile,
    verifyEmail,
    completeSignup,
    resendMobile,
    resendEmail,
    resetOtpSignup,
    clearOtpError,
    loadRMs,
  } = useRMs()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(rmSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      password: "",
    },
  })

  const steps = [
    { id: 1, name: "Details" },
    { id: 2, name: "Mobile OTP" },
    { id: 3, name: "Email OTP" },
    { id: 4, name: "Complete" },
  ]

  // Resend cooldown timers
  useEffect(() => {
    let interval
    if (mobileResendTimer > 0) {
      interval = setInterval(() => {
        setMobileResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [mobileResendTimer])

  useEffect(() => {
    let interval
    if (emailResendTimer > 0) {
      interval = setInterval(() => {
        setEmailResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [emailResendTimer])

  // Reset form state
  const resetForm = () => {
    reset()
    setFormData(null)
    setAadhaarFrontFile(null)
    setPanImageFile(null)
    setFileErrors({ aadhaarFront: "", panImage: "" })
    setMobileOtp("")
    setEmailOtp("")
    setMobileResendTimer(0)
    setEmailResendTimer(0)
    resetOtpSignup()
  }

  // Handle modal close
  const handleClose = () => {
    if (!otpLoading.anyLoading) {
      resetForm()
      onOpenChange(false)
    }
  }

  // Validate files before submission
  const validateFiles = () => {
    const errors = { aadhaarFront: "", panImage: "" }
    let isValid = true

    if (!aadhaarFrontFile) {
      errors.aadhaarFront = "Aadhaar front image is required"
      isValid = false
    }

    if (!panImageFile) {
      errors.panImage = "PAN card image is required"
      isValid = false
    }

    setFileErrors(errors)
    return isValid
  }

  // Step 1: Submit form and initiate OTP
  const handleFormSubmit = async (data) => {
    if (!validateFiles()) {
      toast.error("Please upload both Aadhaar and PAN documents")
      return
    }

    setFormData(data)

    const formDataObj = new FormData()
    formDataObj.append("name", data.name.trim())
    formDataObj.append("email", data.email.trim().toLowerCase())
    formDataObj.append("phone_number", data.phone_number.trim())
    formDataObj.append("password", data.password)
    formDataObj.append("rm_aadhaar_front", aadhaarFrontFile)
    formDataObj.append("rm_pan_image", panImageFile)

    const result = await initiateSignup(formDataObj)

    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("OTPs sent to mobile and email")
      setMobileResendTimer(60) // 60 second cooldown
      setEmailResendTimer(60)
    } else {
      toast.error(result.payload || "Failed to initiate signup")
    }
  }

  // Step 2: Verify mobile OTP
  const handleVerifyMobile = async () => {
    if (mobileOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP")
      return
    }

    const result = await verifyMobile(mobileOtp)

    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Mobile verified successfully")
      setMobileOtp("")
    } else {
      toast.error(result.payload || "Invalid OTP")
    }
  }

  // Step 3: Verify email OTP
  const handleVerifyEmail = async () => {
    if (emailOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP")
      return
    }

    const result = await verifyEmail(emailOtp)

    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Email verified successfully")
      setEmailOtp("")
    } else {
      toast.error(result.payload || "Invalid OTP")
    }
  }

  // Step 4: Complete signup
  const handleComplete = async () => {
    const result = await completeSignup()

    if (result.meta?.requestStatus === "fulfilled") {
      const rmCode = result.payload?.rm_code
      toast.success(`RM created successfully! Code: ${rmCode}`)
      resetForm()
      onOpenChange(false)
      loadRMs() // Refresh the list
      if (onSuccess) {
        onSuccess(result.payload)
      }
    } else {
      toast.error(result.payload || "Failed to create RM")
    }
  }

  // Handle resend OTPs
  const handleResendMobile = async () => {
    if (mobileResendTimer > 0) return
    
    const result = await resendMobile()
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Mobile OTP resent")
      setMobileResendTimer(60)
    } else {
      toast.error(result.payload || "Failed to resend OTP")
    }
  }

  const handleResendEmail = async () => {
    if (emailResendTimer > 0) return
    
    const result = await resendEmail()
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Email OTP resent")
      setEmailResendTimer(60)
    } else {
      toast.error(result.payload || "Failed to resend OTP")
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (otpStep) {
      case 1:
        return (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter full name"
                disabled={otpLoading.initiating}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Phone and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  {...register("phone_number")}
                  placeholder="10 digit number"
                  maxLength={10}
                  disabled={otpLoading.initiating}
                />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address"
                  disabled={otpLoading.initiating}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Min 6 characters"
                disabled={otpLoading.initiating}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Documents */}
            <div className="space-y-3">
              <Label>Documents *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageDropzone
                  label="Aadhaar Front"
                  value={aadhaarFrontFile}
                  onChange={setAadhaarFrontFile}
                  error={fileErrors.aadhaarFront}
                  accept="image/jpeg,image/png"
                  maxSize={5 * 1024 * 1024}
                />
                <ImageDropzone
                  label="PAN Card"
                  value={panImageFile}
                  onChange={setPanImageFile}
                  error={fileErrors.panImage}
                  accept="image/jpeg,image/png"
                  maxSize={5 * 1024 * 1024}
                />
              </div>
            </div>

            {/* Info message */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>OTPs will be sent to verify mobile and email</span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={otpLoading.initiating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={otpLoading.initiating}>
                {otpLoading.initiating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTPs...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </DialogFooter>
          </form>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Verify Mobile Number</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 6-digit OTP sent to {formData?.phone_number}
              </p>
            </div>

            {/* Dev OTP hint */}
            {devOtps.mobile && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 text-center">
                <strong>Dev Mode:</strong> OTP is {devOtps.mobile}
              </div>
            )}

            <OTPInput
              value={mobileOtp}
              onChange={setMobileOtp}
              disabled={otpLoading.verifyingMobile}
            />

            {otpError && (
              <p className="text-sm text-destructive text-center">{otpError}</p>
            )}

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendMobile}
                disabled={mobileResendTimer > 0 || otpLoading.resendingMobile}
              >
                {otpLoading.resendingMobile ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                {mobileResendTimer > 0
                  ? `Resend in ${mobileResendTimer}s`
                  : "Resend OTP"}
              </Button>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={otpLoading.verifyingMobile}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyMobile}
                disabled={otpLoading.verifyingMobile || mobileOtp.length !== 6}
              >
                {otpLoading.verifyingMobile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Mobile"
                )}
              </Button>
            </DialogFooter>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Verify Email Address</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 6-digit OTP sent to {formData?.email}
              </p>
            </div>

            {/* Dev OTP hint */}
            {devOtps.email && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 text-center">
                <strong>Dev Mode:</strong> OTP is {devOtps.email}
              </div>
            )}

            <OTPInput
              value={emailOtp}
              onChange={setEmailOtp}
              disabled={otpLoading.verifyingEmail}
            />

            {otpError && (
              <p className="text-sm text-destructive text-center">{otpError}</p>
            )}

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendEmail}
                disabled={emailResendTimer > 0 || otpLoading.resendingEmail}
              >
                {otpLoading.resendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                {emailResendTimer > 0
                  ? `Resend in ${emailResendTimer}s`
                  : "Resend OTP"}
              </Button>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={otpLoading.verifyingEmail}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyEmail}
                disabled={otpLoading.verifyingEmail || emailOtp.length !== 6}
              >
                {otpLoading.verifyingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </DialogFooter>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">All Verified!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mobile and email have been verified. Click below to create the RM account.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{formData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{formData?.phone_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{formData?.email}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={otpLoading.completing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={otpLoading.completing}
                className="bg-green-600 hover:bg-green-700"
              >
                {otpLoading.completing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating RM...
                  </>
                ) : (
                  "Create RM"
                )}
              </Button>
            </DialogFooter>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {otpStep === 1 && "Create New RM"}
            {otpStep === 2 && "Verify Mobile"}
            {otpStep === 3 && "Verify Email"}
            {otpStep === 4 && "Complete Registration"}
          </DialogTitle>
          <DialogDescription>
            {otpStep === 1 &&
              "Enter RM details and upload documents. OTPs will be sent for verification."}
            {otpStep === 2 && "Verify the mobile number to continue."}
            {otpStep === 3 && "Verify the email address to continue."}
            {otpStep === 4 && "Finalize the RM account creation."}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={otpStep} steps={steps} />

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}

export default CreateRMModal
