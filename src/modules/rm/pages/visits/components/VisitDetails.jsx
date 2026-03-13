import { useLocation, Link } from "react-router-dom"
import {
  ChevronRight,
  User,
  Phone,
  Mail,
  FileText,
  CalendarDays,
  MapPin,
  ImageIcon,
} from "lucide-react"

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—"

const VISIT_TYPE_STYLE = {
  partner: "bg-blue-500/10 text-blue-700 border-blue-200",
  investor: "bg-violet-500/10 text-violet-700 border-violet-200",
}

const InfoCell = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-4">
    <div className="mt-0.5 w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-sm font-semibold mt-0.5 break-words">{value || "—"}</p>
    </div>
  </div>
)

const VisitDetail = () => {
  const { state } = useLocation()
  const visit = state?.visit

  if (!visit)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No visit data found.
      </div>
    )

  const name = visit.contact_display_name || visit.contact_name || "—"
  const number = visit.contact_display_number || visit.contact_number || "—"
  const typeStyle =
    VISIT_TYPE_STYLE[(visit.visit_type || "").toLowerCase()] ||
    "bg-muted text-muted-foreground border-border/50"

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/rm/visits" className="hover:text-foreground transition-colors font-medium">
          Visits
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />
        <span className="text-foreground font-semibold truncate">{name}</span>
      </nav>

      {/* Hero Card */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Visit #{visit.id ?? "—"}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${typeStyle}`}
            >
              {visit.visit_type || "—"}
            </span>
          </div>

          {/* Quick meta row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="w-3 h-3" /> Visit Date
              </span>
              <span className="text-sm font-semibold">{formatDate(visit.created_at)}</span>
            </div>
            {number !== "—" && (
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" /> Mobile
                </span>
                <span className="text-sm font-semibold">{number}</span>
              </div>
            )}
            {visit.contact_display_email && (
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <span className="text-sm font-semibold">{visit.contact_display_email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Panel — 2 cols × 3 rows */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden divide-y divide-border/40">
        {/* Row 1 */}
        <div className="grid grid-cols-2 divide-x divide-border/40">
          <InfoCell icon={User}         label="Contact Name" value={name} />
          <InfoCell icon={Phone}        label="Mobile"       value={number} />
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-2 divide-x divide-border/40">
          <InfoCell icon={Mail}         label="Email"        value={visit.contact_display_email} />
          <InfoCell icon={MapPin}       label="Visit Type"   value={visit.visit_type} />
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-2 divide-x divide-border/40">
          <InfoCell icon={CalendarDays} label="Visit Date"   value={formatDate(visit.created_at)} />
          <InfoCell icon={FileText}     label="Description"  value={visit.description} />
        </div>
      </div>

      {/* Images */}
      {visit.image_urls?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold">Visit Images</p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {visit.image_urls.length} photo{visit.image_urls.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visit.image_urls.map((img, index) => (
              <a
                key={index}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block rounded-2xl overflow-hidden border border-border/50 shadow-sm aspect-square hover:shadow-md transition-shadow"
              >
                <img
                  src={img}
                  alt={`Visit photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default VisitDetail