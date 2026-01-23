import React, { useState, useEffect } from "react"
import {
  Users,
  TrendingUp,
  DollarSign,
  FileCheck,
  Percent,
  Activity,
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
import PageHeader from "@/components/common/PageHeader"
import StatusBadge from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { dashboardService } from "@/lib/api/services"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null)
  const [charts, setCharts] = useState(null)
  const [recentActivity, setRecentActivity] = useState(null)
  const [dateRange, setDateRange] = useState("30")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [metricsData, chartsData, activityData] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getCharts({ dateRange }),
        dashboardService.getRecentActivity(),
      ])
      setMetrics(metricsData)
      setCharts(chartsData)
      setRecentActivity(activityData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#1890FF", "#52C41A", "#FA8C16", "#F5222D", "#13C2C2"]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description={`Last updated: ${format(new Date(), "PPpp")}`}
        action={
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
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
        }
      />

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
          value={`${metrics?.totalInvestments?.count || 0}`}
          subtitle={formatCurrency(metrics?.totalInvestments?.amount || 0)}
          trend={metrics?.totalInvestments?.trend}
          trendLabel={metrics?.totalInvestments?.trendLabel}
          icon={TrendingUp}
          iconColor="green"
        />
        <MetricCard
          title="Active Investments"
          value={`${metrics?.activeInvestments?.count || 0}`}
          subtitle={formatCurrency(metrics?.activeInvestments?.amount || 0)}
          trend={metrics?.activeInvestments?.trend}
          trendLabel={metrics?.activeInvestments?.trendLabel}
          icon={Activity}
          iconColor="orange"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue?.amount || 0)}
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
          className={metrics?.pendingKYC?.count > 0 ? "border-red-200" : ""}
        />
        <MetricCard
          title="Commission Payouts"
          value={formatCurrency(metrics?.commissionPayouts?.amount || 0)}
          trend={metrics?.commissionPayouts?.trend}
          trendLabel={metrics?.commissionPayouts?.trendLabel}
          icon={Percent}
          iconColor="teal"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Volume Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Investment Volume Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts?.investmentVolume || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#1890FF"
                strokeWidth={2}
                name="Investment Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* User Growth */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rm" fill="#1890FF" name="RMs" />
              <Bar dataKey="partner" fill="#52C41A" name="Partners" />
              <Bar dataKey="investor" fill="#FA8C16" name="Investors" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Investment Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Investment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts?.investmentDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(charts?.investmentDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Commission Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Commission Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts?.commissionTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#13C2C2"
                strokeWidth={2}
                name="Commission Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending KYC */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending KYC Verifications</h3>
            <Link to="/admin/kyc">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity?.pendingKYC?.length > 0 ? (
              recentActivity.pendingKYC.slice(0, 5).map((kyc) => (
                <div
                  key={kyc.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{kyc.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {kyc.role} • {format(new Date(kyc.submittedDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <StatusBadge status={kyc.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending KYC verifications
              </p>
            )}
          </div>
        </Card>

        {/* Recent Investments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Investments</h3>
            <Link to="/admin/financial/investments">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity?.recentInvestments?.length > 0 ? (
              recentActivity.recentInvestments.slice(0, 5).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{inv.investorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {inv.productName} • {format(new Date(inv.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(inv.amount)}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent investments
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/financial/payouts">
            <Button variant="outline">Upload Payout PDF</Button>
          </Link>
          <Link to="/admin/products">
            <Button variant="outline">Configure Commission</Button>
          </Link>
          <Button variant="outline">View Reports</Button>
          <Button variant="outline">Export Data</Button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
