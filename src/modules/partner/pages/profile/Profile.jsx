import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchKycDocuments } from "@/modules/partner/store/features/profile/profileThunk"
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  UserCircle2,
  Copy,
  Check,
  X,
  ZoomIn,
  ExternalLink,
  Building2,
  ShieldCheck,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import toast from "react-hot-toast"

// ─── Status color map ─────────────────────────────────────────────────────────

const statusVariant = (status) => {
  const s = status?.toLowerCase()
  if (s === "active")   return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (s === "inactive") return "bg-red-50 text-red-600 border-red-200"
  return "bg-amber-50 text-amber-600 border-amber-200"
}

// ─── Copy referral hook ────────────────────────────────────────────────────────

const useCopy = (text) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success("Referral code copied!")
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return { copied, copy }
}

// ─── Document Preview Modal ───────────────────────────────────────────────────

const DocPreviewModal = ({ documents, initialIndex, onClose }) => {
  const [idx, setIdx] = useState(initialIndex)
  const doc = documents[idx]

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  if (!doc) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="text-sm font-bold text-gray-900 capitalize">
              {doc.document_type.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {idx + 1} of {documents.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="bg-gray-50 flex items-center justify-center min-h-[320px] p-4">
          <img
            src={doc.url}
            alt={doc.document_type}
            className="max-h-[420px] max-w-full object-contain rounded-lg"
          />
        </div>

        {/* Navigation */}
        {documents.length > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
            >
              <ChevronLeft size={14} className="mr-1" />
              Prev
            </Button>

            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {documents.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === idx ? "bg-blue-600 w-4" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIdx((i) => Math.min(documents.length - 1, i + 1))}
              disabled={idx === documents.length - 1}
            >
              Next
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Info row helper ──────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="bg-gray-100 p-1.5 rounded-lg flex-shrink-0">
      <Icon size={13} className="text-gray-500" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 truncate">{value || "—"}</p>
    </div>
  </div>
)

// ─── Profile avatar with fallback ─────────────────────────────────────────────

const ProfileAvatar = ({ src, name, size = "w-20 h-20" }) => {
  const initials = (name || "P")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? "P")}&background=dbeafe&color=1d4ed8&bold=true&size=128`

  return (
    <img
      src={src || fallback}
      alt={name}
      className={`${size} rounded-2xl object-cover border-4 border-white shadow-md flex-shrink-0`}
      onError={(e) => {
        e.target.onerror = null
        e.target.src = fallback
      }}
    />
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const Profile = () => {
  const dispatch = useDispatch()
  const { partner, rm } = useSelector((state) => state.partner.auth)
  const { documents, loading } = useSelector((state) => state.partner.profile)

  const [previewIdx, setPreviewIdx] = useState(null)
  const { copied, copy } = useCopy(partner?.referral_code ?? "")

  useEffect(() => {
    dispatch(fetchKycDocuments())
  }, [dispatch])

  if (!partner) {
    return (
      <div className="space-y-6 pb-10">
        {/* Header skeleton */}
        <div className="border rounded-2xl bg-card p-6">
          <div className="flex gap-5 items-center">
            <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-56" />
              <Skeleton className="h-3.5 w-44" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Document preview modal */}
      {previewIdx !== null && documents?.length > 0 && (
        <DocPreviewModal
          documents={documents}
          initialIndex={previewIdx}
          onClose={() => setPreviewIdx(null)}
        />
      )}

      <div className="space-y-6 pb-10">

        {/* ── Hero profile card ── */}
        <div className="border rounded-2xl bg-card overflow-hidden">
          {/* Blue banner */}
          <div className="h-16 z-0 bg-blue-100 relative">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          <div className="px-6 pb-6 z-10">
            {/* Avatar overlapping banner */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-5">
              <div className="flex items-end gap-4">
                <ProfileAvatar
                  src={partner.profile_image}
                  name={partner.name}
                  size="w-20 h-20"
                />
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {partner.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${statusVariant(partner.status)}`}
                    >
                      {partner.status}
                    </span>
                    {partner.branch?.name && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 size={11} />
                        {partner.branch.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick contact */}
              <div className="flex gap-2 pb-1">
                <a
                  href={`mailto:${partner.email}`}
                  className="flex items-center gap-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Mail size={12} />
                  Email
                </a>
                <a
                  href={`tel:${partner.mobile}`}
                  className="flex items-center gap-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Phone size={12} />
                  Call
                </a>
              </div>
            </div>

            {/* Info grid */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <InfoRow icon={Mail} label="Email" value={partner.email} />
              <div className="sm:pl-8">
                <InfoRow icon={Phone} label="Mobile" value={partner.mobile} />
              </div>
              <div className="sm:pl-8">
                <InfoRow
                  icon={MapPin}
                  label="Branch"
                  value={`${partner.branch?.name ?? ""}${partner.branch?.state_name ? `, ${partner.branch.state_name}` : ""}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-col: RM + Referral ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Relationship Manager */}
          {rm ? (
            <Card className="rounded-2xl border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <UserCircle2 size={15} className="text-blue-500" />
                  Relationship Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <UserCircle2 size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {rm.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Relationship Manager
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${rm.phone_number}`}
                      className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                      title="Call RM"
                    >
                      <Phone size={14} />
                    </a>
                    <a
                      href={`mailto:${rm.email}`}
                      className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
                      title="Email RM"
                    >
                      <Mail size={14} />
                    </a>
                  </div>
                </div>

                <div className="mt-4 space-y-0 divide-y divide-gray-50">
                  {rm.phone_number && (
                    <InfoRow icon={Phone} label="Phone" value={rm.phone_number} />
                  )}
                  {rm.email && (
                    <InfoRow icon={Mail} label="Email" value={rm.email} />
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
                <UserCircle2 size={32} className="opacity-20" />
                <p className="text-sm font-medium">No RM assigned yet</p>
              </CardContent>
            </Card>
          )}

          {/* Referral Code */}
          <Card className="rounded-2xl border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Share2 size={15} className="text-blue-500" />
                Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Share this code with new partners to earn referral rewards.
              </p>

              {/* Code box */}
              <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-3">
                <p className="flex-1 text-lg font-extrabold tracking-[0.2em] text-blue-600 font-mono">
                  {partner.referral_code}
                </p>
                <button
                  onClick={copy}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    copied
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-500" />
                Active and available for referrals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── KYC Documents ── */}
        <Card className="rounded-2xl border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ShieldCheck size={15} className="text-blue-500" />
              KYC Documents
            </CardTitle>
            {!loading && documents?.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </span>
            )}
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : !documents?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
                <FileText size={28} className="opacity-20" />
                <p className="text-sm font-medium">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {documents.map((doc, i) => (
                  <div
                    key={doc.document_type}
                    className="group border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setPreviewIdx(i)}
                  >
                    {/* Image */}
                    <div className="relative bg-gray-50 h-28 overflow-hidden">
                      <img
                        src={doc.url}
                        alt={doc.document_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.style.display = "none"
                        }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <ZoomIn size={14} className="text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Label */}
                    <div className="px-2.5 py-2 bg-white">
                      <p className="text-[11px] font-semibold text-gray-600 capitalize flex items-center gap-1 truncate">
                        <FileText size={10} className="text-gray-400 flex-shrink-0" />
                        {doc.document_type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </>
  )
}

export default Profile