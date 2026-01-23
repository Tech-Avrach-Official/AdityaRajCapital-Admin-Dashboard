import React, { useState, useEffect } from "react"
import {
  Users,
  TrendingUp,
  DollarSign,
  FileCheck,
  Percent,
  Activity,
  Calendar,
  Download,
  FileText,
  Settings,
  RefreshCw,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardService } from "@/lib/api/services"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null)
  const [charts, setCharts] = useState(null)
  const [recentActivity, setRecentActivity] = useState(null)
  const [dateRange, setDateRange] = useState("30")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    try {
      const [metricsData, chartsData, activityData] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getCharts({ dateRange }),
        dashboardService.getRecentActivity(),
      ])
      setMetrics(metricsData)
      setCharts(chartsData)
      setRecentActivity(activityData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadDashboardData(true)
  }

  const COLORS = ["#1890FF", "#52C41A", "#FA8C16", "#F5222D", "#13C2C2"]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCompactCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }
    return formatCurrency(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {format(lastUpdated, "PPpp")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="border-0 shadow-none focus:ring-0 h-auto w-[140px] p-0">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers?.count || 0}
          trend={metrics?.totalUsers?.trend}
          trendLabel={metrics?.totalUsers?.trendLabel}
          icon={Users}
          iconColor="blue"
        />
        <MetricCard
          title="Total Investments"
          value={metrics?.totalInvestments?.count || 0}
          subtitle={formatCompactCurrency(metrics?.totalInvestments?.amount || 0)}
          trend={metrics?.totalInvestments?.trend}
          trendLabel={metrics?.totalInvestments?.trendLabel}
          icon={TrendingUp}
          iconColor="green"
        />
        <MetricCard
          title="Active Investments"
          value={metrics?.activeInvestments?.count || 0}
          subtitle={formatCompactCurrency(metrics?.activeInvestments?.amount || 0)}
          trend={metrics?.activeInvestments?.trend}
          trendLabel={metrics?.activeInvestments?.trendLabel}
          icon={Activity}
          iconColor="orange"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCompactCurrency(metrics?.totalRevenue?.amount || 0)}
          trend={metrics?.totalRevenue?.trend}
          trendLabel={metrics?.totalRevenue?.trendLabel}
          icon={DollarSign}
          iconColor="purple"
        />
        <MetricCard
          title="Pending KYC"
          value={metrics?.pendingKYC?.count || 0}
          icon={FileCheck}
          iconColor="red"
          className={cn(
            metrics?.pendingKYC?.count > 0 && "border-red-200 bg-red-50/50"
          )}
        />
        <MetricCard
          title="Commission Payouts"
          value={formatCompactCurrency(metrics?.commissionPayouts?.amount || 0)}
          trend={metrics?.commissionPayouts?.trend}
          trendLabel={metrics?.commissionPayouts?.trendLabel}
          icon={Percent}
          iconColor="teal"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Volume Trend */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Investment Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts?.investmentVolume || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                  tickFormatter={(value) => formatCompactCurrency(value).replace('₹', '')}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#1890FF"
                  strokeWidth={2.5}
                  dot={{ fill: "#1890FF", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Investment Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.userGrowth || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="rm" fill="#1890FF" name="RMs" radius={[4, 4, 0, 0]} />
                <Bar dataKey="partner" fill="#52C41A" name="Partners" radius={[4, 4, 0, 0]} />
                <Bar dataKey="investor" fill="#FA8C16" name="Investors" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investment Distribution */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Investment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts?.investmentDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}\n${percentage}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(charts?.investmentDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commission Trends */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Commission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts?.commissionTrends || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                  tickFormatter={(value) => formatCompactCurrency(value).replace('₹', '')}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#13C2C2"
                  strokeWidth={2.5}
                  dot={{ fill: "#13C2C2", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Commission Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending KYC */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Pending KYC Verifications</CardTitle>
              <Link to="/admin/kyc">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity?.pendingKYC?.length > 0 ? (
                recentActivity.pendingKYC.slice(0, 5).map((kyc) => (
                  <div
                    key={kyc.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{kyc.userName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {kyc.role} • {format(new Date(kyc.submittedDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <StatusBadge status={kyc.status} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No pending KYC verifications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Investments */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Investments</CardTitle>
              <Link to="/admin/financial/investments">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity?.recentInvestments?.length > 0 ? (
                recentActivity.recentInvestments.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{inv.investorName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {inv.productName} • {format(new Date(inv.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="font-semibold text-sm">{formatCompactCurrency(inv.amount)}</p>
                      <div className="mt-1">
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent investments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/financial/payouts">
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Upload Payout PDF
              </Button>
            </Link>
            <Link to="/admin/products">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Configure Commission
              </Button>
            </Link>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              View Reports
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
