import { useCallback, useEffect, useState } from "react"
import { X, Plus, ImageIcon, AlertCircle, Loader2, Users, UserPlus, Handshake, TrendingUp } from "lucide-react"
import { subUsers } from "@/modules/rm/api/services/subUsers"
import { toast } from "react-hot-toast"
import { visits } from "@/modules/rm/api/services/visits"
import { useNavigate } from "react-router-dom"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PageHeader from "@/components/common/PageHeader"

const MAX_IMAGES = 4

const AddVisits = () => {
  const navigate = useNavigate()
  const [partners, setPartners] = useState([])
  const [investors, setInvestors] = useState([])
  const [loading, setLoading] = useState(false)

  const [visitType, setVisitType] = useState("partner")
  const [isExisting, setIsExisting] = useState(true)

  const [selectedPartnerId, setSelectedPartnerId] = useState("")
  const [selectedInvestorId, setSelectedInvestorId] = useState("")

  const [contactName, setContactName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [description, setDescription] = useState("")

  const [imageFiles, setImageFiles] = useState([])
  const [validationError, setValidationError] = useState(null)
  const [createLoading, setCreateLoading] = useState(false)

  const createError = null

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await subUsers.getSubUsers()
        setPartners(data?.partners ?? [])
        setInvestors(data?.investors ?? [])
      } catch (error) {
        console.log(error)
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pickImages = useCallback((e) => {
    const remaining = MAX_IMAGES - imageFiles.length
    if (remaining <= 0) return
    const files = Array.from(e.target.files || []).slice(0, remaining)
    const newFiles = files.map((file) => ({
      uri: URL.createObjectURL(file),
      file,
      type: file.type || "image/jpeg",
      fileName: file.name,
    }))
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, MAX_IMAGES))
    e.target.value = ""
  }, [imageFiles.length])

  const removeImage = useCallback((index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = async () => {
    try {
      setCreateLoading(true)
      setValidationError(null)

      if (imageFiles.length === 0) {
        setValidationError("Please upload at least 1 image")
        return
      }

      const formData = new FormData()
      formData.append("visit_type", visitType)
      formData.append("is_existing", isExisting)

      if (isExisting) {
        if (visitType === "partner") {
          if (!selectedPartnerId) { setValidationError("Please select partner"); return }
          formData.append("partner_id", selectedPartnerId)
        }
        if (visitType === "investor") {
          if (!selectedInvestorId) { setValidationError("Please select investor"); return }
          formData.append("investor_id", selectedInvestorId)
        }
      } else {
        if (!contactName) { setValidationError("Contact name required"); return }
        if (contactNumber.length !== 10) { setValidationError("Enter valid 10 digit number"); return }
        formData.append("contact_name", contactName)
        formData.append("contact_number", contactNumber)
      }

      if (description) formData.append("description", description)
      imageFiles.forEach((img) => formData.append("visit_images", img.file))

      const res = await visits.addVisits(formData)
      toast.success(res.message || "Visit recorded")
      setCreateLoading(false)
      navigate("/rm/visits")
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || "Failed to record visit")
    }
  }

  return (
    <div className="max-w-2xl py-8 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <PageHeader title="Record Visit" />
        <p className="text-sm text-muted-foreground">Log a client or lead visit with proof</p>
      </div>

      {/* Visit Type */}
      <Section title="Who did you meet?">
        <div className="grid grid-cols-2 gap-3">
          <TypeCard
            active={visitType === "partner"}
            onClick={() => setVisitType("partner")}
            icon={Handshake}
            label="Partner"
            desc="Business partner visit"
            color="blue"
          />
          <TypeCard
            active={visitType === "investor"}
            onClick={() => setVisitType("investor")}
            icon={TrendingUp}
            label="Investor"
            desc="Investor meeting"
            color="violet"
          />
        </div>
      </Section>

      {/* Existing / New Lead */}
      <Section title="Existing user or new lead?">
        <div className="grid grid-cols-2 gap-3">
          <TypeCard
            active={isExisting}
            onClick={() => setIsExisting(true)}
            icon={Users}
            label="Existing"
            desc="Already registered user"
            color="emerald"
          />
          <TypeCard
            active={!isExisting}
            onClick={() => setIsExisting(false)}
            icon={UserPlus}
            label="New Lead"
            desc="First time contact"
            color="amber"
          />
        </div>
      </Section>

      {/* Existing User Select */}
      {isExisting && (
        <Section title={visitType === "partner" ? "Select Partner" : "Select Investor"}>
          {visitType === "partner" ? (
            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name} #{p.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={selectedInvestorId} onValueChange={setSelectedInvestorId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Investor" />
              </SelectTrigger>
              <SelectContent>
                {investors.map((i) => (
                  <SelectItem key={i.id} value={i.id.toString()}>
                    {i.name} ({i.client_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Section>
      )}

      {/* New Lead Fields */}
      {!isExisting && (
        <div className="space-y-4">
          <Section title="Contact Name">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter contact name"
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </Section>
          <Section title="Contact Number">
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </Section>
        </div>
      )}

      {/* Notes */}
      <Section title="Notes (optional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Add any notes about the visit..."
          className="w-full px-4 py-3 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        />
      </Section>

      {/* Images */}
      <Section title={`Proof Images (1–${MAX_IMAGES})`}>
        <div className="flex flex-wrap gap-3">
          {imageFiles.map((f, index) => (
            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border">
              <img src={f.uri} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-0.5 transition"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}

          {imageFiles.length < MAX_IMAGES && (
            <label className="w-20 h-20 border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition gap-1">
              <Plus className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
            </label>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {imageFiles.length} of {MAX_IMAGES} images added
            </p>
            <p className="text-xs text-muted-foreground">{Math.round((imageFiles.length / MAX_IMAGES) * 100)}%</p>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(imageFiles.length / MAX_IMAGES) * 100}%` }}
            />
          </div>
        </div>
      </Section>

      {/* Validation Error */}
      {(validationError || createError) && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {validationError || createError}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={createLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition"
      >
        {createLoading && <Loader2 className="animate-spin w-4 h-4" />}
        {createLoading ? "Recording..." : "Record Visit"}
      </button>

    </div>
  )
}

/* ── Sub-components ── */

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    {children}
  </div>
)

const colorMap = {
  blue:    { card: "border-blue-200 bg-blue-50",     icon: "bg-blue-100 text-blue-600",    text: "text-blue-700"    },
  violet:  { card: "border-violet-200 bg-violet-50", icon: "bg-violet-100 text-violet-600",text: "text-violet-700"  },
  emerald: { card: "border-emerald-200 bg-emerald-50",icon:"bg-emerald-100 text-emerald-600",text:"text-emerald-700"},
  amber:   { card: "border-amber-200 bg-amber-50",   icon: "bg-amber-100 text-amber-600",  text: "text-amber-700"   },
}

const TypeCard = ({ active, onClick, icon: Icon, label, desc, color }) => {
  const c = colorMap[color]
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
        active ? `${c.card} border-current` : "border-gray-100 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? c.icon : "bg-gray-100 text-gray-400"}`}>
          <Icon size={15} />
        </div>
        <div>
          <p className={`text-sm font-semibold leading-tight ${active ? c.text : "text-gray-700"}`}>{label}</p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
        </div>
      </div>
    </button>
  )
}

export default AddVisits