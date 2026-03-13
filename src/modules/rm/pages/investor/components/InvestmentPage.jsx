import { useLocation, Link } from "react-router-dom"
import {
  ChevronRight,
  CalendarCheck,
  CalendarDays,
  Wallet,
  TrendingUp,
  BadgeIndianRupee,
  Clock,
  ShieldCheck,
  BarChart3,
  ArrowDownToLine,
} from "lucide-react"

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"

const formatINR = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—"

const STATUS_STYLES = {
  active:    "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  pending:   "bg-amber-500/10 text-amber-700 border-amber-200",
  completed: "bg-blue-500/10 text-blue-700 border-blue-200",
  rejected:  "bg-red-500/10 text-red-700 border-red-200",
}

const StatusPill = ({ status }) => {
  const cls = STATUS_STYLES[(status || "").toLowerCase()] || "bg-muted text-muted-foreground border-border/50"
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${cls}`}>
      {status || "—"}
    </span>
  )
}

const InfoRow = ({ icon: Icon, label, value, valueClass = "" }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </div>
    <span className={`text-sm font-semibold text-right ${valueClass}`}>{value ?? "—"}</span>
  </div>
)

const SectionCard = ({ icon: Icon, title, subtitle, accent, children }) => (
  <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    <div className="px-5">{children}</div>
  </div>
)

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
)

const InvestmentPage = () => {
  const { state } = useLocation()
  const inv = state?.investment
  console.log(inv)
  if (!inv)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No investment data found.
      </div>
    )

  const returns = inv.plan_snapshot?.returns
  const details = inv.plan_snapshot?.investment_details

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/rm/investors" className="hover:text-foreground transition-colors font-medium">
          Investors
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />
        <span className="text-foreground font-semibold truncate">{inv.plan_name}</span>
      </nav>

      {/* Hero Card */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{inv.plan_name}</h1>
              <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/60 inline-block px-2 py-0.5 rounded-md">
                #{inv.id}
              </p>
            </div>
            <StatusPill status={inv.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wallet className="w-3 h-3" /> Amount
              </span>
              <span className="text-sm font-semibold">{formatINR(inv.amount)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="w-3 h-3" /> Initialized
              </span>
              <span className="text-sm font-semibold">{formatDate(inv.initialized_at)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarCheck className="w-3 h-3" /> Verified
              </span>
              <span className="text-sm font-semibold">{formatDate(inv.payment_verified_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label="Duration"
          value={`${returns?.duration_months ?? "—"} mo`}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Profit"
          value={returns?.profit_per_month_percent != null ? `${returns.profit_per_month_percent}%` : "—"}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          icon={BadgeIndianRupee}
          label="Total Received"
          value={details?.total_received_display ?? "—"}
          accent="bg-violet-500/10 text-violet-600"
        />
      </div>

      {/* Plan Returns */}
      <SectionCard
        icon={BarChart3}
        title="Plan Returns"
        subtitle="Monthly profit & capital breakdown"
        accent="bg-blue-500/10 text-blue-600"
      >
        <InfoRow icon={Clock}            label="Duration"         value={`${returns?.duration_months} months`} />
        <InfoRow icon={TrendingUp}       label="Profit / Month"   value={`${returns?.profit_per_month_percent}%`} valueClass="text-emerald-600" />
        <InfoRow icon={ArrowDownToLine}  label="Capital / Month"  value={`${returns?.capital_per_month_percent}%`} valueClass="text-blue-600" />
        <div className="py-4">
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-xl px-4 py-3">
            {returns?.description}
          </p>
        </div>
      </SectionCard>

      {/* Monthly Payout */}
      <SectionCard
        icon={BadgeIndianRupee}
        title="Monthly Payout"
        subtitle="What you receive each month"
        accent="bg-emerald-500/10 text-emerald-600"
      >
        <InfoRow icon={Wallet}           label="Monthly Payout"   value={details?.monthly_payout_display} />
        <InfoRow icon={TrendingUp}       label="Profit Portion"   value={formatINR(details?.monthly_payout_profit)}   valueClass="text-emerald-600" />
        <InfoRow icon={ArrowDownToLine}  label="Capital Portion"  value={formatINR(details?.monthly_payout_capital)}  valueClass="text-blue-600" />
        <InfoRow icon={ShieldCheck}      label="Total Received"   value={details?.total_received_display} />
      </SectionCard>

    </div>
  )
}

export default InvestmentPage