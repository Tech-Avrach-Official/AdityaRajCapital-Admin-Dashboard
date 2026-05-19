import React, { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  Info,
  CheckCircle2,
  Phone,
  Mail,
  RefreshCw
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usersService } from "@/modules/admin/api/services/usersService"
import { hierarchyService } from "@/modules/admin/api/services/hierarchyService"

// Zod Validation Schema
const investorSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Email must be a valid email address"),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  referral_type: z.enum(["partner", "rm"]),
  partner_id: z.string().optional(),
  rm_id: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.referral_type === "partner" && (!data.partner_id || data.partner_id === "none")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a partner",
      path: ["partner_id"],
    })
  }
  if (data.referral_type === "rm" && (!data.rm_id || data.rm_id === "none")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select an RM",
      path: ["rm_id"],
    })
  }
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
  
  const getOtpArray = (val) => {
    const arr = (val || "").split("").slice(0, length)
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

const CreateInvestorModal = ({ open, onOpenChange, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(null)
  
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [branches, setBranches] = useState([])
  const [partners, setPartners] = useState([])
  const [rms, setRMs] = useState([])
  const [dataLoading, setDataLoading] = useState(false)

  // OTP inputs
  const [mobileOtp, setMobileOtp] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const mobileOtpRef = useRef("")
  const emailOtpRef = useRef("")
  
  const [signupRequestId, setSignupRequestId] = useState(null)
  
  // MPIN Setup Data
  const [mpinData, setMpinData] = useState(null)
  const [mpin, setMpin] = useState("")

  // Resend cooldown timer
  const [resendTimer, setResendTimer] = useState(0)

  const steps = [
    { id: 1, name: "Details" },
    { id: 2, name: "Verify" },
    { id: 3, name: "MPIN" },
  ]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      referral_type: "partner",
      partner_id: "",
      rm_id: "",
    },
  })

  const referralType = watch("referral_type")
  const selectedPartnerId = watch("partner_id")
  const selectedRmId = watch("rm_id")

  useEffect(() => {
    if (!open) return
    let isMounted = true
    setDataLoading(true)

    const loadData = async () => {
      try {
        const [branchRes, partnerRes, rmRes] = await Promise.all([
          hierarchyService.getBranches(),
          usersService.getPartners({ status: "active" }),
          usersService.getRMs({ status: "active" }),
        ])
        if (isMounted) {
          setBranches(branchRes.branches ?? [])
          setPartners(partnerRes.data ?? [])
          setRMs(rmRes.data ?? [])
        }
      } catch (err) {
        console.error("Failed to load selectors data", err)
        toast.error("Failed to load referral data")
      } finally {
        if (isMounted) setDataLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [open])

  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleClose = () => {
    if (!submitting) {
      reset()
      setShowPassword(false)
      setStep(1)
      setFormData(null)
      setMobileOtp("")
      setEmailOtp("")
      setMpin("")
      mobileOtpRef.current = ""
      emailOtpRef.current = ""
      setSignupRequestId(null)
      setMpinData(null)
      setResendTimer(0)
      onOpenChange(false)
    }
  }

  // Step 1 -> 2: Initiate Signup
  const handleFormSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        mobile: data.mobile.trim(),
        password: data.password,
      }
      
      // Determine referral code to send to the backend
      if (data.referral_type === "partner" && data.partner_id) {
        const p = partners.find(p => String(p.id) === String(data.partner_id))
        payload.referral_code = p ? p.partnerId : ""
      } else if (data.referral_type === "rm" && data.rm_id) {
        const r = rms.find(r => String(r.id) === String(data.rm_id))
        payload.referral_code = r ? r.rm_code : ""
      } else {
        payload.referral_code = ""
      }

      // 1. API call to initiate signup
      const result = await usersService.initiateInvestorSignup(payload)
      if (result.success) {
        setSignupRequestId(result.data.signup_request_id)
        setFormData(payload)
        toast.success("OTPs sent to mobile and email")
        setResendTimer(60)
        setStep(2)
      } else {
        toast.error(result.message || "Failed to initiate signup")
      }
    } catch (err) {
      toast.error(err.message || "Failed to initiate signup")
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2 -> 3: Verify Both OTPs
  const handleVerifyOTPs = async () => {
    const mOtp = mobileOtpRef.current
    const eOtp = emailOtpRef.current

    if (!mOtp || mOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit Mobile OTP")
      return
    }
    if (!eOtp || eOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit Email OTP")
      return
    }

    setSubmitting(true)
    try {
      // 2. Verify both OTPs at once
      const verifyResult = await usersService.verifyAndCompleteInvestorSignup(signupRequestId, mOtp, eOtp)
      
      if (verifyResult.success) {
        toast.success("OTPs verified successfully")
        setMpinData({
          investor_id: verifyResult.data.investor_id,
          mpin_setup_token: verifyResult.data.mpin_setup_token
        })
        setStep(3)
      } else {
        toast.error(verifyResult.message || "Invalid OTPs")
      }
    } catch (err) {
      toast.error(err.message || "Invalid OTPs or server error")
    } finally {
      setSubmitting(false)
    }
  }

  // Step 3 -> 4: Set MPIN and complete
  const handleSetMpin = async () => {
    if (!mpin || mpin.length !== 4) {
      toast.error("Please enter a 4-digit MPIN")
      return
    }

    setSubmitting(true)
    try {
      const mpinResult = await usersService.setInvestorMpin(mpinData.investor_id, mpinData.mpin_setup_token, mpin)
      
      if (mpinResult.success) {
        toast.success("Investor created successfully.")
        setStep(4)
        if (onSuccess) {
          onSuccess() // Reload investors list in background
        }
      } else {
        toast.error(mpinResult.message || "Failed to set MPIN")
      }
    } catch (err) {
      toast.error(err.message || "Failed to set MPIN")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendOTPs = async () => {
    if (resendTimer > 0) return
    setSubmitting(true)
    try {
      await usersService.resendInvestorOtp(signupRequestId)
      toast.success("OTPs resent successfully")
      setResendTimer(60)
    } catch (err) {
      toast.error("Failed to resend OTPs")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register("name")} placeholder="e.g. Anil Kumar" disabled={submitting} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="e.g. investor@example.com" disabled={submitting} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input id="mobile" type="tel" {...register("mobile")} placeholder="10-digit mobile number" maxLength={10} disabled={submitting} />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Login Password *</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} placeholder="Minimum 6 characters" disabled={submitting} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>



            <div className="border-t border-border pt-3 space-y-3">
              <div className="space-y-1">
                <Label>Referral Source *</Label>
                <Select value={referralType} onValueChange={(value) => { setValue("referral_type", value); setValue("partner_id", ""); setValue("rm_id", ""); }} disabled={submitting}>
                  <SelectTrigger><SelectValue placeholder="Select referral source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Referred by Partner</SelectItem>
                    <SelectItem value="rm">Referred by RM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {referralType === "partner" && (
                <div className="space-y-1">
                  <Label htmlFor="partner_id">Select Partner *</Label>
                  <Select value={selectedPartnerId} onValueChange={(value) => setValue("partner_id", value, { shouldValidate: true })} disabled={submitting || dataLoading}>
                    <SelectTrigger><SelectValue placeholder={dataLoading ? "Loading partners..." : "Select partner"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Choose a partner...</SelectItem>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name} {p.partnerId ? `(${p.partnerId})` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.partner_id && <p className="text-xs text-destructive">{errors.partner_id.message}</p>}
                </div>
              )}

              {referralType === "rm" && (
                <div className="space-y-1">
                  <Label htmlFor="rm_id">Select RM *</Label>
                  <Select value={selectedRmId} onValueChange={(value) => setValue("rm_id", value, { shouldValidate: true })} disabled={submitting || dataLoading}>
                    <SelectTrigger><SelectValue placeholder={dataLoading ? "Loading RMs..." : "Select RM"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Choose an RM...</SelectItem>
                      {rms.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.name} {r.rm_code ? `(${r.rm_code})` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rm_id && <p className="text-xs text-destructive">{errors.rm_id.message}</p>}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-xs">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Note: OTPs will be sent to the mobile number and email.</span>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Initiating...</> : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        )
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Verify Contact Details</h3>
              <p className="text-sm text-muted-foreground mt-1">Please enter both OTPs to continue.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <Label>Mobile OTP sent to {formData?.mobile}</Label>
              </div>
              <OTPInput value={mobileOtp} onChange={(val) => { setMobileOtp(val); mobileOtpRef.current = val; }} disabled={submitting} />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                <Label>Email OTP sent to {formData?.email}</Label>
              </div>
              <OTPInput value={emailOtp} onChange={(val) => { setEmailOtp(val); emailOtpRef.current = val; }} disabled={submitting} />
            </div>

            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" onClick={handleResendOTPs} disabled={resendTimer > 0 || submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                {resendTimer > 0 ? `Resend OTPs in ${resendTimer}s` : "Resend Both OTPs"}
              </Button>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
              <Button onClick={handleVerifyOTPs} disabled={submitting || mobileOtp.length !== 6 || emailOtp.length !== 6}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...</> : "Verify OTPs"}
              </Button>
            </DialogFooter>
          </div>
        )
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Set MPIN</h3>
              <p className="text-sm text-muted-foreground mt-1">Create a 4-digit MPIN for this investor.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-center">
                <OTPInput value={mpin} onChange={setMpin} disabled={submitting} length={4} />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSetMpin} disabled={submitting || mpin.length !== 4}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Completing...</> : "Complete Setup"}
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
              <h3 className="text-lg font-semibold">Investor Created!</h3>
              <p className="text-sm text-muted-foreground mt-1">The investor has been successfully created and secured with the MPIN.</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-medium">{formData?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mobile:</span><span className="font-medium">{formData?.mobile}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="font-medium">{formData?.email}</span></div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button onClick={handleClose} className="w-full bg-green-600 hover:bg-green-700">
                Close
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <UserPlus className="w-5 h-5" />
            <DialogTitle>Create Investor Manually</DialogTitle>
          </div>
          <DialogDescription>
            Register a new investor manually. Login credentials and an automated Client ID will be created.
          </DialogDescription>
        </DialogHeader>
        
        {step > 1 && step < 4 && <StepIndicator currentStep={step} steps={steps} />}

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}

export default CreateInvestorModal
