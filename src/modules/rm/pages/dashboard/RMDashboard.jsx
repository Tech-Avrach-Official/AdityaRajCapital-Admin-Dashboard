import React, { useEffect, useState } from "react"
import { Users, Percent, Wallet, Clock, RefreshCw, TrendingUp, BadgeIndianRupee, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { dashboardService } from "@/modules/rm/api/services/dashboardServices"
import toast from "react-hot-toast"
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Link } from "react-router-dom"

const PERIOD_OPTIONS = [
  { value: "overall", label: "Overall" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
]

const BAR_COLORS = ["#3b82f6", "#10b981"]
const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"]

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0)

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

const RMDashboard = () => {
  const [period, setPeriod] = useState("overall")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [report, setReport] = useState(null)

  const handleExport = (report) => {

  if (!report) return

  const headers = [
    "Total Partners",
    "Total Investors",
    "Commission Earned",
    "Receivable Commission",
    "Pending Commission"
  ]

  const rows = [[
    report.total_partners ?? 0,
    report.total_investors ?? 0,
    report.total_commission_earned ?? 0,
    report.total_receivable_commission ?? 0,
    report.total_pending_commission ?? 0
  ]]

  const csv =
    [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "rm-dashboard-report.csv")

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
  const loadReport = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      const data = await dashboardService.getReport(period)
      setReport(data)
      if (isRefresh) toast.success("Dashboard updated")
    } catch (err) {
      toast.error(err?.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [period])

  if (loading && !report)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm animate-pulse">
        Loading dashboard…
      </div>
    )

  const currentMonth = new Date().toISOString().slice(0, 7)
  const chartData = [
    {
      month: currentMonth,
      investors: report?.total_investors ?? 0,
      partners: report?.total_partners ?? 0,
    },
  ]
  const commissionData = [
    { name: "Earned", value: report?.total_commission_earned ?? 0 },
    { name: "Receivable", value: report?.total_receivable_commission ?? 0 },
    { name: "Pending", value: report?.total_pending_commission ?? 0 },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RM Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of your performance and activity
          </p>
        </div>
    <div className="flex items-center gap-3">

  <Select value={period} onValueChange={setPeriod}>
    <SelectTrigger className="w-[140px] rounded-xl border-border/60">
      <SelectValue placeholder="Period" />
    </SelectTrigger>
    <SelectContent>
      {PERIOD_OPTIONS.map((p) => (
        <SelectItem key={p.value} value={p.value}>
          {p.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  <Button
    variant="outline"
    size="icon"
    onClick={() => loadReport(true)}
    disabled={refreshing}
    className="rounded-xl border-border/60"
  >
    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
  </Button>

  {/* Export Button */}
  <Button
    variant="outline"
    onClick={() => handleExport(report)}
    className="rounded-xl border-border/60"
  >
    <Download className="w-4 h-4 mr-2" />
    Export
  </Button>

</div>
        {/* <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] rounded-xl border-border/60">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => loadReport(true)}
            disabled={refreshing}
            className="rounded-xl border-border/60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div> */}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Partners"
          value={report?.total_partners ?? 0}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Total Investors"
          value={report?.total_investors ?? 0}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          icon={Percent}
          label="Commission Earned"
          value={formatCurrency(report?.total_commission_earned)}
          accent="bg-orange-500/10 text-orange-600"
        />
        <StatCard
          icon={Wallet}
          label="Receivable Commission"
          value={formatCurrency(report?.total_receivable_commission)}
          accent="bg-violet-500/10 text-violet-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Commission"
          value={formatCurrency(report?.total_pending_commission)}
          accent="bg-red-500/10 text-red-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar Chart */}
        <Link to="/rm/investors" className="block group">
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm group-hover:shadow-md transition-shadow overflow-hidden h-full">
            <div className="p-5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">User Growth</p>
                  <p className="text-xs text-muted-foreground">Investors & Partners</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                    />
                    <Bar dataKey="investors" fill={BAR_COLORS[0]} name="Investors" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="partners" fill={BAR_COLORS[1]} name="Partners" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Pie Chart */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <BadgeIndianRupee className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Commission Distribution</p>
                <p className="text-xs text-muted-foreground">Earned · Receivable · Pending</p>
              </div>
            </div>
          </div>
          <div className="p-0">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={commissionData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                  innerRadius={48}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {commissionData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}

export default RMDashboard