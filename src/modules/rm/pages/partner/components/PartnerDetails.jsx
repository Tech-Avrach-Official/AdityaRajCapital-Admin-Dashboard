import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import StatusBadge from "@/components/common/StatusBadge"
import { subUsers } from "@/modules/rm/api/services/subUsers"
import { getProfileImageUrl } from "@/lib/utils"
import {
  ChevronRight,
  UserCheck,
  Link2,
  CalendarDays,
  Users,
  BadgeIndianRupee,
  Copy,
  CheckCheck,
  Mail,
  Phone,
} from "lucide-react"

const formatDate = (date) => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

const CopyableValue = ({ value }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium">{value ?? "—"}</span>
      {value && (
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied
            ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
            : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  )
}

const InfoItem = ({ icon: Icon, label, children }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="w-3 h-3" />
      {label}
    </div>
    <div className="text-sm font-medium">{children}</div>
  </div>
)

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
)

const PartnerDetails = () => {
  const { id } = useParams()
  const [partner, setPartner] = useState(null)

  useEffect(() => {
    const loadPartner = async () => {
      try {
        const data = await subUsers.getPartnerDetail(id)
        setPartner(data)
      } catch (err) {
        console.log(err)
      }
    }
    loadPartner()
  }, [id])

  if (!partner)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm animate-pulse">
        Loading partner details…
      </div>
    )

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/rm/partners" className="hover:text-foreground transition-colors font-medium">
          Partners
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />
        <span className="text-foreground font-semibold truncate">{partner.name}</span>
      </nav>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar className="h-20 w-20 shrink-0 rounded-2xl border-2 border-border/60 shadow-md">
            <AvatarImage
              src={getProfileImageUrl(partner.profile_image)}
              alt={partner.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-xl font-bold">
              {getInitials(partner.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight truncate">{partner.name}</h1>
              <StatusBadge status={partner.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <InfoItem icon={Mail} label="Email">
                <span className="truncate block">{partner.email ?? "—"}</span>
              </InfoItem>
              <InfoItem icon={Phone} label="Mobile">
                {partner.mobile ?? "—"}
              </InfoItem>
              <InfoItem icon={UserCheck} label="Signup Status">
                <span className="capitalize">{partner.signup_status ?? "—"}</span>
              </InfoItem>
              <InfoItem icon={CalendarDays} label="Member Since">
                {formatDate(partner.created_at)}
              </InfoItem>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Codes */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Link2 className="w-3 h-3" />
            Partner Referral Code
          </div>
          <CopyableValue value={partner.partner_referral_code} />
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Link2 className="w-3 h-3" />
            RM Referral Code
          </div>
          <CopyableValue value={partner.referral_code} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={Users}
          label="Total Investors"
          value={partner.referral_summary?.referred_investors_count ?? 0}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={BadgeIndianRupee}
          label="Partner Commission"
          value={`₹${Number(partner.commission_earned ?? 0).toLocaleString("en-IN")}`}
          accent="bg-emerald-500/10 text-emerald-600"
        />
      </div>

    </div>
  )
}

export default PartnerDetails