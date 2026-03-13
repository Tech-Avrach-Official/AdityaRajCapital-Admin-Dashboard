import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ChevronDown, X, Plus, ImageIcon, AlertCircle, Loader2 } from "lucide-react"
import { fetchRmSubUsers } from "@/redux/features/rmSubUsers/rmSubUsersThunks"
import { createRmVisit } from "@/redux/features/rmVisits/rmVisitsThunks"
import { useNavigate } from "react-router-dom"

const MAX_IMAGES = 4

const AddVisits = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { partners, investors } = useSelector((state) => state.rmSubUsers)
  const { createLoading, createError } = useSelector((state) => state.rmVisits)

  const [visitType, setVisitType] = useState("partner")
  const [isExisting, setIsExisting] = useState(true)
  const [selectedPartnerId, setSelectedPartnerId] = useState(null)
  const [selectedInvestorId, setSelectedInvestorId] = useState(null)
  const [contactName, setContactName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [description, setDescription] = useState("")
  const [imageFiles, setImageFiles] = useState([])
  const [partnerModalVisible, setPartnerModalVisible] = useState(false)
  const [investorModalVisible, setInvestorModalVisible] = useState(false)
  const [validationError, setValidationError] = useState(null)

  useEffect(() => {
    dispatch(fetchRmSubUsers())
  }, [dispatch])

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

  const buildFormData = useCallback(() => {
    const formData = new FormData()
    formData.append("visit_type", visitType)
    formData.append("is_existing", isExisting ? "true" : "false")
    if (isExisting) {
      if (visitType === "partner" && selectedPartnerId != null)
        formData.append("partner_id", Number(selectedPartnerId))
      if (visitType === "investor" && selectedInvestorId != null)
        formData.append("investor_id", Number(selectedInvestorId))
    } else {
      formData.append("contact_name", contactName.trim())
      formData.append("contact_number", contactNumber.trim().replace(/\D/g, "").slice(0, 10))
    }
    if (description.trim()) formData.append("description", description.trim())
    imageFiles.forEach((f) => formData.append("visit_images", f.file, f.fileName))
    return formData
  }, [visitType, isExisting, selectedPartnerId, selectedInvestorId, contactName, contactNumber, description, imageFiles])

  const validate = useCallback(() => {
    if (imageFiles.length < 1) return "Please add at least 1 proof image (max 4)."
    if (isExisting) {
      if (visitType === "partner" && !selectedPartnerId) return "Please select a partner."
      if (visitType === "investor" && !selectedInvestorId) return "Please select an investor."
    } else {
      if (!contactName.trim()) return "Please enter contact name."
      if (contactNumber.trim().replace(/\D/g, "").length !== 10)
        return "Please enter a valid 10-digit contact number."
    }
    return null
  }, [imageFiles.length, isExisting, visitType, selectedPartnerId, selectedInvestorId, contactName, contactNumber])

  const onSubmit = useCallback(async () => {
    setValidationError(null)
    const err = validate()
    if (err) { setValidationError(err); return }
    const formData = buildFormData()
    const result = await dispatch(createRmVisit(formData))
    if (createRmVisit.fulfilled.match(result)) {
      const id = result.payload?.id
      id != null ? navigate(`/rm/visits/${id}`) : navigate(-1)
    }
  }, [validate, buildFormData, dispatch, navigate])

  const selectedPartner = partners?.find((p) => p.id === selectedPartnerId || p.id === Number(selectedPartnerId))
  const selectedInvestor = investors?.find((i) => i.id === selectedInvestorId || i.id === Number(selectedInvestorId))

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Record Visit</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Log a client or lead visit with proof</p>
      </div>

      {/* Who did you meet */}
      <Section title="Who did you meet?">
        <div className="flex gap-3">
          <ChipButton active={visitType === "partner"} onClick={() => setVisitType("partner")}>
            Partner
          </ChipButton>
          <ChipButton active={visitType === "investor"} onClick={() => setVisitType("investor")}>
            Investor
          </ChipButton>
        </div>
      </Section>

      {/* Existing or New */}
      <Section title="Existing user or new lead?">
        <div className="flex gap-3">
          <ChipButton active={isExisting} onClick={() => setIsExisting(true)}>Existing</ChipButton>
          <ChipButton active={!isExisting} onClick={() => setIsExisting(false)}>New Lead</ChipButton>
        </div>
      </Section>

      {/* Conditional fields */}
      {isExisting ? (
        <Section title={visitType === "partner" ? "Select Partner" : "Select Investor"}>
          <button
            onClick={() => visitType === "partner" ? setPartnerModalVisible(true) : setInvestorModalVisible(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 bg-card text-sm hover:bg-muted/40 transition-colors"
          >
            <span className={selectedPartner || selectedInvestor ? "text-foreground font-medium" : "text-muted-foreground"}>
              {visitType === "partner"
                ? selectedPartner
                  ? `${selectedPartner.name} #${selectedPartner.id}`
                  : "Tap to select partner"
                : selectedInvestor
                ? `${selectedInvestor.name} ${selectedInvestor.client_id ? `(${selectedInvestor.client_id})` : ""}`
                : "Tap to select investor"}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </Section>
      ) : (
        <div className="space-y-5">
          <Section title="Contact Name *">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Name of person met"
              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
            />
          </Section>
          <Section title="Contact Number (10 digits) *">
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
            />
          </Section>
        </div>
      )}

      {/* Notes */}
      <Section title="Notes (optional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Visit notes, observations…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border/60 bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition resize-none"
        />
      </Section>

      {/* Proof Images */}
      <Section title={`Proof Images (1–${MAX_IMAGES}) *`}>
        <div className="flex flex-wrap gap-3">
          {imageFiles.map((f, index) => (
            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/50 shadow-sm group">
              <img src={f.uri} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {imageFiles.length < MAX_IMAGES && (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-colors">
              <Plus className="w-6 h-6 text-primary" />
              <span className="text-xs text-primary font-medium">Add</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          {imageFiles.length}/{MAX_IMAGES} images added
        </p>
      </Section>

      {/* Error */}
      {(validationError || createError) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{validationError || createError}</span>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={createLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {createLoading ? "Recording…" : "Record Visit"}
      </button>

      {/* Partner Modal */}
      <BottomModal
        visible={partnerModalVisible}
        title="Select Partner"
        onClose={() => setPartnerModalVisible(false)}
      >
        {partners?.map((item) => (
          <ModalRow
            key={item.id}
            label={`${item.name || "Partner"} #${item.id}`}
            active={selectedPartnerId === item.id}
            onClick={() => { setSelectedPartnerId(item.id); setPartnerModalVisible(false) }}
          />
        ))}
      </BottomModal>

      {/* Investor Modal */}
      <BottomModal
        visible={investorModalVisible}
        title="Select Investor"
        onClose={() => setInvestorModalVisible(false)}
      >
        {investors?.map((item) => (
          <ModalRow
            key={item.id}
            label={`${item.name || "Investor"}${item.client_id ? ` (${item.client_id})` : ""}`}
            active={selectedInvestorId === item.id}
            onClick={() => { setSelectedInvestorId(item.id); setInvestorModalVisible(false) }}
          />
        ))}
      </BottomModal>
    </div>
  )
}

/* ── Sub-components ── */

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <p className="text-sm font-semibold text-foreground">{title}</p>
    {children}
  </div>
)

const ChipButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-xl border text-sm font-medium transition-colors ${
      active
        ? "border-primary bg-primary/10 text-primary"
        : "border-border/60 bg-card text-muted-foreground hover:bg-muted/40"
    }`}
  >
    {children}
  </button>
)

const BottomModal = ({ visible, title, onClose, children }) => {
  if (!visible) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-2xl shadow-xl max-h-[60vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <p className="text-sm font-bold">{title}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

const ModalRow = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-5 py-3.5 border-b border-border/40 text-sm transition-colors last:border-0 ${
      active ? "text-primary font-semibold bg-primary/5" : "text-foreground hover:bg-muted/40"
    }`}
  >
    {label}
  </button>
)

export default AddVisits