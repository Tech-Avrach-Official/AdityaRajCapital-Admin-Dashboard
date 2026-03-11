import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Users,
  TrendingUp,
  Percent,
  Activity,
  Download,
  FileText,
  Settings,
  RefreshCw,
  AlertCircle,
  MapPin,
  Building2,
  Globe,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import MetricCard from "@/components/common/MetricCard"
import StatusBadge from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { dashboardService } from "@/modules/admin/api/services/dashboardService"

const DATE_RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 3 months" },
  { value: "180", label: "Last 6 months" },
  { value: "365", label: "This year" },
]

const COLORS = ["#1890FF", "#52C41A", "#FA8C16", "#F5222D", "#13C2C2"]

const LIST_LIMIT = 8

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("30")
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const [summary, setSummary] = useState(null)
  const [pendingPayments, setPendingPayments] = useState([])
  const [recentPurchases, setRecentPurchases] = useState([])
  const [investmentVolume, setInvestmentVolume] = useState([])
  const [userGrowth, setUserGrowth] = useState([])
  const [investmentByPlan, setInvestmentByPlan] = useState([])
  const [commissionStats, setCommissionStats] = useState({ total_paid: 0, by_month: [] })
  const [commissionTrendPercent, setCommissionTrendPercent] = useState(null)
  const [installmentSummary, setInstallmentSummary] = useState(null)
  const dateRangeChangedRef = useRef(false)

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount ?? 0)
  }, [])

  const formatCompactCurrency = useCallback((amount) => {
    if (amount == null || amount === 0) return "₹0"
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`
    return formatCurrency(amount)
  }, [formatCurrency])

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try {
        const periodKey = dateRange
        const [
          summaryRes,
          pendingPaymentsRes,
          recentRes,
          volumeRes,
          growthRes,
          byPlanRes,
          commissionRes,
          installmentRes,
        ] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getPendingPaymentVerifications(),
          dashboardService.getRecentPurchases(LIST_LIMIT),
          dashboardService.getInvestmentVolume(periodKey).then((r) => r.series ?? []),
          dashboardService.getUserGrowth(periodKey).then((r) => r.series ?? []),
          dashboardService.getInvestmentByPlan().then((r) => r.plans ?? []),
          dashboardService.getCommissionStats(periodKey),
          dashboardService.getInstallmentSummary(),
        ])

        setSummary(summaryRes)
        setPendingPayments(pendingPaymentsRes)
        setRecentPurchases(recentRes)
        setInvestmentVolume(volumeRes)
        setUserGrowth(growthRes)
        setInvestmentByPlan(byPlanRes)
        setCommissionStats(commissionRes)
        setInstallmentSummary(installmentRes)
        setLastUpdated(new Date())

        try {
          const prevCommission = await dashboardService.getCommissionStats(periodKey, true)
          const currSum = (commissionRes.by_month ?? []).reduce((a, b) => a + (b.amount ?? 0), 0)
          const prevSum = (prevCommission.by_month ?? []).reduce((a, b) => a + (b.amount ?? 0), 0)
          setCommissionTrendPercent(
            prevSum > 0 ? Math.round(((currSum - prevSum) / prevSum) * 100) : null
          )
        } catch {
          setCommissionTrendPercent(null)
        }

        if (isRefresh) toast.success("Dashboard updated")
      } catch (err) {
        const message = err?.message || err?.data?.message || "Failed to load dashboard"
        setError(message)
        const status = err?.response?.status ?? err?.status
        if (status === 403) setError("Access denied")
        else if (status === 500 || status === 0) setError("Something went wrong. Please try again.")
        if (!isRefresh) toast.error(message)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [dateRange]
  )

  const loadTrendsOnly = useCallback(async () => {
    const periodKey = dateRange
    setError(null)
    try {
      const [volumeRes, growthRes, commissionRes, commissionPrevRes] = await Promise.all([
        dashboardService.getInvestmentVolume(periodKey).then((r) => r.series ?? []),
        dashboardService.getUserGrowth(periodKey).then((r) => r.series ?? []),
        dashboardService.getCommissionStats(periodKey),
        dashboardService.getCommissionStats(periodKey, true),
      ])
      setInvestmentVolume(volumeRes)
      setUserGrowth(growthRes)
      setCommissionStats(commissionRes)
      const currSum = (commissionRes.by_month ?? []).reduce((a, b) => a + (b.amount ?? 0), 0)
      const prevSum = (commissionPrevRes.by_month ?? []).reduce((a, b) => a + (b.amount ?? 0), 0)
      const trendPct =
        prevSum > 0 ? Math.round(((currSum - prevSum) / prevSum) * 100) : null
      setCommissionTrendPercent(trendPct)
    } catch (err) {
      setError(err?.message || "Failed to load trends")
    }
  }, [dateRange])

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (!dateRangeChangedRef.current) {
      dateRangeChangedRef.current = true
      return
    }
    if (summary !== null) loadTrendsOnly()
  }, [dateRange])

  const handleRefresh = () => {
    loadDashboard(true)
  }

  const handleExport = () => {
    const rows = []
    rows.push(["Pending payment verification", "Investor", "Plan", "Amount", "Date"])
    pendingPayments.slice(0, 50).forEach((p) => {
      rows.push([
        p.investorName,
        p.plan,
        String(p.amount ?? 0),
        p.date ? format(new Date(p.date), "yyyy-MM-dd") : "",
      ])
    })
    rows.push([])
    rows.push(["Recent investments", "Investor", "Plan", "Amount", "Date", "Status"])
    recentPurchases.slice(0, 50).forEach((p) => {
      rows.push([
        p.investorName,
        p.plan,
        String(p.amount ?? 0),
        p.date ? format(new Date(p.date), "yyyy-MM-dd") : "",
        p.status ?? "",
      ])
    })
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-export-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Export downloaded")
  }

  const counts = summary?.counts ?? {}
  const purchaseStats = summary?.purchase_stats ?? {}
  const totalAmountByStatus = purchaseStats?.total_amount_by_status ?? {}
  const paymentsToVerify = purchaseStats?.payment_verification ?? pendingPayments.length
  const hasAttention = paymentsToVerify > 0

  const hierarchy = {
    nations: counts.nations ?? 0,
    states: counts.states ?? 0,
    branches: counts.branches ?? 0,
  }

  const pieData = (investmentByPlan ?? []).map((p) => ({
    name: p.plan_name ?? p.name ?? "Plan",
    value: Number(p.amount ?? 0),
    percentage: Number(p.percentage ?? 0),
  })).filter((d) => d.value > 0)

  if (loading && !summary) {
    return (
      <div className="space-y-8 pb-10">
        <header className="flex flex-col gap-5 border-b border-border/60 pb-8">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48" />
        </header>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <Skeleton className="h-[380px] rounded-lg" />
          <Skeleton className="h-[380px] rounded-lg" />
        </div>
      </div>
    )
  }

  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-center font-medium text-foreground">{error}</p>
        <Button onClick={() => loadDashboard()}>Try again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-5 border-b border-border/60 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Platform Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              {lastUpdated
                ? `Last updated: ${format(lastUpdated, "PPp")}`
                : "Loading…"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-10 w-[170px] border-border/60 bg-background">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              title="Export"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {hasAttention && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-5 py-4 dark:border-amber-800/50 dark:bg-amber-950/30">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            <span className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Requires attention
            </span>
            {paymentsToVerify > 0 && (
              <Link
                to="/admin/financial/payment-verification"
                className="font-medium text-primary hover:underline"
              >
                {paymentsToVerify} payments to verify
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
        <Link to="/admin/users/investors" className="block h-full transition-opacity hover:opacity-95">
          <MetricCard
            title="Total Users"
            value={counts.total_users ?? 0}
            subtext={`Investors: ${counts.investors ?? 0} · Partners: ${counts.partners ?? 0} · RMs: ${counts.rms ?? 0}`}
            icon={Users}
            iconColor="blue"
            className="cursor-pointer"
          />
        </Link>
        <Link to="/admin/financial/investments" className="block h-full transition-opacity hover:opacity-95">
          <MetricCard
            title="Total Investments"
            value={formatCompactCurrency(purchaseStats.total_amount)}
            subtitle={`${purchaseStats.total_count ?? purchaseStats.count ?? 0} investments`}
            icon={TrendingUp}
            iconColor="green"
            className="cursor-pointer"
          />
        </Link>
        <Link to="/admin/financial/investments" className="block h-full transition-opacity hover:opacity-95">
          <MetricCard
            title="Active Investments"
            value={purchaseStats.active ?? 0}
            subtitle={formatCompactCurrency(totalAmountByStatus.active)}
            icon={Activity}
            iconColor="orange"
            className="cursor-pointer"
          />
        </Link>
        <Link to="/admin/financial/payment-verification" className="block h-full transition-opacity hover:opacity-95">
          <MetricCard
            title="Pending verification"
            value={paymentsToVerify}
            subtext="Purchases awaiting payment approval"
            icon={ShieldCheck}
            iconColor="red"
            variant="action"
            className="cursor-pointer"
          />
        </Link>
        <Link to="/admin/financial/commissions" className="block h-full transition-opacity hover:opacity-95">
          <MetricCard
            title="Commission paid"
            value={formatCompactCurrency(commissionStats.total_paid)}
            trend={commissionTrendPercent ?? undefined}
            trendLabel={commissionTrendPercent != null ? "from last period" : undefined}
            icon={Percent}
            iconColor="teal"
            className="cursor-pointer"
          />
        </Link>
        <Link to="/admin/financial/payouts" className="block h-full transition-opacity hover:opacity-95">
          <MetricCard
            title="Payouts due (this month)"
            value={installmentSummary?.due_this_month_count ?? 0}
            subtitle={formatCompactCurrency(installmentSummary?.due_this_month_amount)}
            icon={FileText}
            iconColor="orange"
            className="cursor-pointer"
          />
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/admin/hierarchy/nations"
          className="inline-flex items-center gap-2.5 rounded-lg border border-border/50 bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/40"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span>{hierarchy.nations}</span>
          <span className="text-muted-foreground">Nations</span>
        </Link>
        <span className="text-muted-foreground/70">·</span>
        <Link
          to="/admin/hierarchy/states"
          className="inline-flex items-center gap-2.5 rounded-lg border border-border/50 bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/40"
        >
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{hierarchy.states}</span>
          <span className="text-muted-foreground">States</span>
        </Link>
        <span className="text-muted-foreground/70">·</span>
        <Link
          to="/admin/hierarchy/branches"
          className="inline-flex items-center gap-2.5 rounded-lg border border-border/50 bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/40"
        >
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{hierarchy.branches}</span>
          <span className="text-muted-foreground">Branches</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Link to="/admin/financial/investments" className="block transition-opacity hover:opacity-95">
          <Card className="overflow-hidden border-border/40 shadow-sm cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Investment volume trend</CardTitle>
            </CardHeader>
            <CardContent>
            {investmentVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={investmentVolume}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="stroke-muted-foreground" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="stroke-muted-foreground"
                    tickFormatter={(v) => formatCompactCurrency(v).replace("₹", "").trim()}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={COLORS[0]}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS[0], r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Amount (L/Cr)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data for selected period
              </div>
            )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/users/investors" className="block transition-opacity hover:opacity-95">
          <Card className="overflow-hidden border-border/40 shadow-sm cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">User growth</CardTitle>
            </CardHeader>
            <CardContent>
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="stroke-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="stroke-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="investors" fill={COLORS[2]} name="Investors" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="partners" fill={COLORS[1]} name="Partners" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rms" fill={COLORS[0]} name="RMs" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data for selected period
              </div>
            )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Link to="/admin/plans" className="block transition-opacity hover:opacity-95">
          <Card className="overflow-hidden border-border/40 shadow-sm cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Investment distribution</CardTitle>
            </CardHeader>
            <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No plan data
              </div>
            )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/financial/commissions" className="block transition-opacity hover:opacity-95">
          <Card className="overflow-hidden border-border/40 shadow-sm cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Commission trends</CardTitle>
            </CardHeader>
            <CardContent>
            {(commissionStats.by_month ?? []).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={commissionStats.by_month}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="stroke-muted-foreground" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="stroke-muted-foreground"
                    tickFormatter={(v) => formatCompactCurrency(v).replace("₹", "").trim()}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={COLORS[4]}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS[4], r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Commission (L)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data for selected period
              </div>
            )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Link to="/admin/financial/payment-verification" className="font-semibold text-base hover:underline">
                <CardTitle className="text-base font-semibold">Pending payment verification</CardTitle>
              </Link>
              <Link to="/admin/financial/payment-verification">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingPayments.length > 0 ? (
                pendingPayments.slice(0, LIST_LIMIT).map((pv) => (
                  <Link
                    key={pv.id}
                    to="/admin/financial/payment-verification"
                    className="flex items-center justify-between gap-2 rounded-lg border border-transparent bg-muted/30 p-3 transition-colors hover:border-border hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{pv.investorName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {pv.plan} ·{" "}
                        {pv.date ? format(new Date(pv.date), "MMM d, yyyy") : "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatCompactCurrency(pv.amount)}
                      </span>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 pointer-events-none">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center">
                  <ShieldCheck className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No pending payment verifications
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Link to="/admin/financial/investments" className="font-semibold text-base hover:underline">
                <CardTitle className="text-base font-semibold">Recent investments</CardTitle>
              </Link>
              <Link to="/admin/financial/investments">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentPurchases.length > 0 ? (
                recentPurchases.slice(0, LIST_LIMIT).map((inv) => (
                  <Link
                    key={inv.id}
                    to="/admin/financial/investments"
                    className="flex items-center justify-between gap-2 rounded-lg border border-transparent bg-muted/30 p-3 transition-colors hover:border-border hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{inv.investorName}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {inv.plan} ·{" "}
                        {inv.date ? format(new Date(inv.date), "MMM d, yyyy") : "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">{formatCompactCurrency(inv.amount)}</p>
                      <StatusBadge status={inv.status} className="mt-1" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center">
                  <TrendingUp className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No recent investments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Link to="/admin/financial/payouts" className="block transition-opacity hover:opacity-95">
        <Card className="border-border/40 shadow-sm cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Upcoming / overdue payouts
              </CardTitle>
              <span className="text-xs text-primary font-medium">View all</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-4 text-center text-sm text-muted-foreground">
              {installmentSummary?.due_this_month_count != null &&
              installmentSummary.due_this_month_count > 0 ? (
                <p>
                  <span className="font-medium text-foreground">
                    {installmentSummary.due_this_month_count}
                  </span>{" "}
                  payout(s) due this month ·{" "}
                  <span className="font-medium text-foreground">
                    {formatCompactCurrency(installmentSummary.due_this_month_amount)}
                  </span>
                  . View payouts for details.
                </p>
              ) : (
                <p>No upcoming payouts data from API. View payouts page for full list.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/financial/payouts">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Upload payout PDF
              </Button>
            </Link>
            <Link to="/admin/plans">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Manage plans
              </Button>
            </Link>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <BarChart3 className="h-4 w-4" />
              View reports
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export data
            </Button>
            <Link to="/admin/financial/payment-verification">
              <Button variant="outline" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Verify payments
              </Button>
            </Link>
            <Link to="/admin/hierarchy/nations">
              <Button variant="outline" className="gap-2">
                <Globe className="h-4 w-4" />
                Hierarchy
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
