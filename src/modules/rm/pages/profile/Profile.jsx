import React, { useState } from "react"
import { useSelector } from "react-redux"
import {
  Mail,
  Phone,
  MapPin,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  Share2,
  Globe,
  Hash,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"

// ── Status badge styles ───────────────────────────────────────────────────────
const statusVariant = (status) => {
  const s = status?.toLowerCase()
  if (s === "active")   return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (s === "inactive") return "bg-red-50 text-red-600 border-red-200"
  return "bg-amber-50 text-amber-600 border-amber-200"
}

const statusDot = (status) => {
  const s = status?.toLowerCase()
  if (s === "active")   return "bg-emerald-500"
  if (s === "inactive") return "bg-red-500"
  return "bg-amber-500"
}

// ── Copy hook ─────────────────────────────────────────────────────────────────
const useCopy = (text) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success("RM Code copied!")
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return { copied, copy }
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const ProfileAvatar = ({ src, name }) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name ?? "RM"
  )}&background=dbeafe&color=1d4ed8`
  return (
    <img
      src={src || fallback}
      alt={name}
      className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
      onError={(e) => {
        e.target.onerror = null
        e.target.src = fallback
      }}
    />
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, color = "blue" }) => {
  const colors = {
    blue:   "bg-blue-50   text-blue-600   border-blue-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    teal:   "bg-teal-50   text-teal-600   border-teal-100",
    amber:  "bg-amber-50  text-amber-600  border-amber-100",
  }
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${colors[color]}`}>
      <Icon size={13} />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-xs font-bold leading-tight">{value || "—"}</p>
      </div>
    </div>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, accent = "#6366f1" }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${accent}14` }}
    >
      <Icon size={14} style={{ color: accent }} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 truncate">{value || "—"}</p>
    </div>
  </div>
)

// ── Format date ───────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ── Main Component ────────────────────────────────────────────────────────────
const Profile = () => {
  const { rm } = useSelector((state) => state.rm.auth)
  const { copied, copy } = useCopy(rm?.rm_code || "")

  if (!rm) return null

  return (
    <div className="space-y-4 pb-10  mx-auto">

      {/* ── HERO PROFILE CARD ── */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">

        {/* Cover banner with subtle dot pattern */}
        <div className="h-16 relative overflow-hidden bg-gradient-to-r from-blue-200 via-indigo-400  to-blue-200">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="px-6 pb-6">

          {/* Avatar + name row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-2">

            <div className="flex items-end gap-4">
              <ProfileAvatar src={rm.profile_image} name={rm.name} />
              <div className="mb-1">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{rm.name}</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">
                  Relationship Manager
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusVariant(rm.status)}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(rm.status)}`} />
                    {rm.status}
                  </span>
                  {rm.branch_name && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                      <Building2 size={10} />
                      {rm.branch_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mb-1">
              <a
                href={`mailto:${rm.email}`}
                className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl transition-colors"
              >
                <Mail size={12} /> Email
              </a>
              <a
                href={`tel:${rm.phone_number}`}
                className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl transition-colors"
              >
                <Phone size={12} /> Call
              </a>
            </div>

          </div>

          {/* Stat pills */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatPill icon={Hash}      label="ID"     value={`#${rm.id}`}    color="blue"   />
            <StatPill icon={Globe}     label="Nation" value={rm.nation_name} color="violet" />
            <StatPill icon={MapPin}    label="State"  value={rm.state_name}  color="teal"   />
            <StatPill icon={Building2} label="Branch" value={rm.branch_name} color="amber"  />
          </div>

        </div>
      </div>

      {/* ── CONTACT DETAILS CARD ── */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail size={13} className="text-blue-500" />
            </div>
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <InfoRow icon={Mail}     label="Email"        value={rm.email}        accent="#6366f1" />
            <InfoRow icon={Phone}    label="Phone"        value={rm.phone_number} accent="#06b6d4" />
            <InfoRow
              icon={MapPin}
              label="Branch"
              value={`${rm.branch_name ?? ""}${rm.state_name ? `, ${rm.state_name}` : ""}`}
              accent="#f59e0b"
            />
            <InfoRow icon={Calendar} label="Last Updated" value={formatDate(rm.updated_at)} accent="#10b981" />
          </div>
        </CardContent>
      </Card>

      {/* ── RM CODE CARD ── */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center">
              <Share2 size={13} className="text-violet-500" />
            </div>
            RM Code
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <p className="text-xs text-muted-foreground mb-3">
            Share this code for internal reference and verification.
          </p>

          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-xl px-4 py-3.5">
            <p className="flex-1 text-base font-extrabold tracking-[0.18em] text-blue-700 font-mono">
              {rm.rm_code}
            </p>
            <button
              onClick={copy}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                copied
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-emerald-500" />
            Verified active RM account
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

export default Profile