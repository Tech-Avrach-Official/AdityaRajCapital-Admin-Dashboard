import React, { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  EyeOff,
  UserPlus,
  Building2,
} from "lucide-react"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import ImageDropzone from "@/components/common/ImageDropzone"
import { useRMs } from "@/hooks"
import { hierarchyService } from "@/lib/api/services"
import { compressImageForUpload } from "@/lib/utils/imageCompression"

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

const steps = [
  { id: 1, name: "Details" },
  { id: 2, name: "Mobile OTP" },
  { id: 3, name: "Email OTP" },
  { id: 4, name: "Complete" },
]

const OTPInput = ({ value, onChange, disabled, length = 6 }) => {
  const inputRefs = useRef([])
  const getOtpArray = (val) => {
    const arr = (val || "").split("").slice(0, length)
    while (arr.length < length) arr.push("")
    return arr
  }
  const [otp, setOtp] = useState(() => getOtpArray(value))
  useEffect(() => setOtp(getOtpArray(value)), [value, length])
  const handleChange = (index, e) => {
    const val = e.target.value
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[index] = val.slice(-1)
    setOtp(newOtp)
    onChange(newOtp.join(""))
    if (val && index < length - 1) inputRefs.current[index + 1]?.focus()
  }
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, length)
    if (!/^\d+$/.test(pastedData)) return
    const newOtp = getOtpArray(pastedData)
    setOtp(newOtp)
    onChange(newOtp.join(""))
    const nextEmptyIndex = newOtp.findIndex((d) => d === "")
    inputRefs.current[nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex]?.focus()
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

const CreateRMPage = () => {
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null)
  const [panImageFile, setPanImageFile] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [mobileOtp, setMobileOtp] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const mobileOtpRef = useRef("")
  const emailOtpRef = useRef("")
  const [mobileResendTimer, setMobileResendTimer] = useState(0)
  const [emailResendTimer, setEmailResendTimer] = useState(0)

  const {
    otpStep,
    otpLoading,
    otpError,
    initiateSignup,
    verifyMobile,
    verifyEmail,
    completeSignup,
    resendMobile,
    resendEmail,
    resetOtpSignup,
    loadRMs,
  } = useRMs()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(rmSchema),
    defaultValues: { name: "", email: "", phone_number: "", password: "" },
  })

  // Reset OTP flow when entering the page so we always start from step 1
  useEffect(() => {
    resetOtpSignup()
  }, [resetOtpSignup])

  useEffect(() => {
    hierarchyService.getBranches().then(({ branches: list }) => setBranches(list ?? [])).catch(() => setBranches([]))
  }, [])

  useEffect(() => {
    let interval
    if (mobileResendTimer > 0) interval = setInterval(() => setMobileResendTimer((p) => p - 1), 1000)
    return () => clearInterval(interval)
  }, [mobileResendTimer])
  useEffect(() => {
    let interval
    if (emailResendTimer > 0) interval = setInterval(() => setEmailResendTimer((p) => p - 1), 1000)
    return () => clearInterval(interval)
  }, [emailResendTimer])

  const handleFormSubmit = async (data) => {
    const branchId = selectedBranchId ? Number(selectedBranchId) : null
    if (!branchId || branchId < 1) {
      toast.error("Please select a branch")
      return
    }
    const formDataObj = new FormData()
    formDataObj.append("name", data.name.trim())
    formDataObj.append("email", data.email.trim().toLowerCase())
    formDataObj.append("phone_number", data.phone_number.trim())
    formDataObj.append("password", data.password)
    formDataObj.append("branch_id", branchId)
    if (aadhaarFrontFile) {
      try {
        const compressed = await compressImageForUpload(aadhaarFrontFile)
        formDataObj.append("rm_aadhaar_front", compressed)
      } catch (_) {
        formDataObj.append("rm_aadhaar_front", aadhaarFrontFile)
      }
    }
    if (panImageFile) {
      try {
        const compressed = await compressImageForUpload(panImageFile)
        formDataObj.append("rm_pan_image", compressed)
      } catch (_) {
        formDataObj.append("rm_pan_image", panImageFile)
      }
    }
    const result = await initiateSignup(formDataObj)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("OTPs sent to mobile and email")
      setMobileResendTimer(60)
      setEmailResendTimer(60)
    } else {
      toast.error(result.payload || "Failed to initiate signup")
    }
  }

  const handleVerifyMobile = async () => {
    const otp = mobileOtpRef.current
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP")
      return
    }
    const result = await verifyMobile(otp)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Mobile verified successfully")
      setMobileOtp("")
      mobileOtpRef.current = ""
    } else {
      toast.error(result.payload || "Invalid OTP")
    }
  }

  const handleVerifyEmail = async () => {
    const otp = emailOtpRef.current
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP")
      return
    }
    const result = await verifyEmail(otp)
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Email verified successfully")
      setEmailOtp("")
      emailOtpRef.current = ""
    } else {
      toast.error(result.payload || "Invalid OTP")
    }
  }

  const handleComplete = async () => {
    const result = await completeSignup()
    if (result.meta?.requestStatus === "fulfilled") {
      const payload = result.payload
      const rmId = payload?.id ?? payload?.rm_id
      toast.success(`RM created successfully! Code: ${payload?.rm_code ?? ""}`)
      resetOtpSignup()
      loadRMs()
      if (rmId) navigate(`/admin/users/rms/${rmId}`)
      else navigate("/admin/users/rms")
    } else {
      toast.error(result.payload || "Failed to create RM")
    }
  }

  const handleResendMobile = async () => {
    if (mobileResendTimer > 0) return
    const result = await resendMobile()
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Mobile OTP resent")
      setMobileResendTimer(60)
    } else toast.error(result.payload || "Failed to resend OTP")
  }

  const handleResendEmail = async () => {
    if (emailResendTimer > 0) return
    const result = await resendEmail()
    if (result.meta?.requestStatus === "fulfilled") {
      toast.success("Email OTP resent")
      setEmailResendTimer(60)
    } else toast.error(result.payload || "Failed to resend OTP")
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/users/rms" className="hover:text-foreground transition-colors">RMs</Link>
        <span>/</span>
        <span className="font-medium text-foreground">Create RM</span>
      </nav>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users/rms" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to RMs
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            Create Relationship Manager
          </CardTitle>
          <CardDescription>
            Follow the steps: enter details, verify mobile and email with OTP, then complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors",
                    index + 1 < otpStep && "bg-emerald-500 text-white",
                    index + 1 === otpStep && "bg-primary text-primary-foreground",
                    index + 1 > otpStep && "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1 < otpStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-1 mx-1 rounded",
                      index + 1 < otpStep ? "bg-emerald-500" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {otpStep === 1 && (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name *</Label>
                  <Input id="name" {...register("name")} placeholder="Full name" disabled={otpLoading.initiating} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone (10 digits) *</Label>
                  <Input
                    id="phone_number"
                    {...register("phone_number")}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={otpLoading.initiating}
                  />
                  {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="rm@example.com"
                  disabled={otpLoading.initiating}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (min 6) *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    disabled={otpLoading.initiating}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Branch *</Label>
                <Select
                  value={selectedBranchId}
                  onValueChange={setSelectedBranchId}
                  disabled={otpLoading.initiating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {[b.name, b.state_name].filter(Boolean).join(" · ") || b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Documents (optional)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageDropzone
                    label="Aadhaar front"
                    value={aadhaarFrontFile}
                    onChange={setAadhaarFrontFile}
                    accept="image/jpeg,image/png"
                    maxSize={5 * 1024 * 1024}
                  />
                  <ImageDropzone
                    label="PAN card"
                    value={panImageFile}
                    onChange={setPanImageFile}
                    accept="image/jpeg,image/png"
                    maxSize={5 * 1024 * 1024}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={otpLoading.initiating} className="gap-2">
                  {otpLoading.initiating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending OTPs...
                    </>
                  ) : (
                    "Send OTPs"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/admin/users/rms">Cancel</Link>
                </Button>
              </div>
            </form>
          )}

          {otpStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Verify mobile number</h3>
                <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit OTP sent to your mobile.</p>
              </div>
              <OTPInput
                value={mobileOtp}
                onChange={(val) => {
                  setMobileOtp(val)
                  mobileOtpRef.current = val
                }}
                disabled={otpLoading.verifyingMobile}
              />
              {otpError && <p className="text-sm text-destructive text-center">{otpError}</p>}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendMobile}
                  disabled={mobileResendTimer > 0 || otpLoading.resendingMobile}
                >
                  {mobileResendTimer > 0 ? `Resend in ${mobileResendTimer}s` : "Resend OTP"}
                </Button>
                <Button
                  onClick={handleVerifyMobile}
                  disabled={otpLoading.verifyingMobile || mobileOtp.length !== 6}
                  className="gap-2"
                >
                  {otpLoading.verifyingMobile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify mobile"
                )}
                </Button>
              </div>
            </div>
          )}

          {otpStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold">Verify email address</h3>
                <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit OTP sent to your email.</p>
              </div>
              <OTPInput
                value={emailOtp}
                onChange={(val) => {
                  setEmailOtp(val)
                  emailOtpRef.current = val
                }}
                disabled={otpLoading.verifyingEmail}
              />
              {otpError && <p className="text-sm text-destructive text-center">{otpError}</p>}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendEmail}
                  disabled={emailResendTimer > 0 || otpLoading.resendingEmail}
                >
                  {emailResendTimer > 0 ? `Resend in ${emailResendTimer}s` : "Resend OTP"}
                </Button>
                <Button
                  onClick={handleVerifyEmail}
                  disabled={otpLoading.verifyingEmail || emailOtp.length !== 6}
                  className="gap-2"
                >
                  {otpLoading.verifyingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify email"
                  )}
                </Button>
              </div>
            </div>
          )}

          {otpStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold">Ready to create</h3>
              <p className="text-sm text-muted-foreground">Mobile and email verified. Click below to complete RM creation.</p>
              <Button onClick={handleComplete} disabled={otpLoading.completing} className="gap-2">
                {otpLoading.completing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Complete & create RM"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateRMPage
