import React, { useEffect, useState } from "react"
import { RefreshCw, Download, Percent, Users, TrendingUp, BarChart3 } from "lucide-react"
import { format } from "date-fns"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import MetricCard from "@/components/common/MetricCard"
import { fetchPartnerDashboardData } from "../../store/features/dashboard/dashboardThunk"
import CommissionComparisonChart from "../dashbord/components/CommissionComparisonChart"
import InvestorInvestmentChart from "../dashbord/components/InvestorInvestmentChart"
import RecentInvestors from "../dashbord/components/RecentInvestors"
import GoalsSection from "../dashbord/components/GoalsSection"

const DATE_RANGE_OPTIONS = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 3 months" },
]

export default function Dashboard() {
    const dispatch = useDispatch()

    const { commissionSummary, investorSummary, loading } = useSelector(
        (state) => state.partner.dashboard
    )

    const investors = investorSummary?.investors || []

    console.log("all investors:", investorSummary?.investors)

    const {
        totalInvestors = 0,
        activeInvestors = 0,
        totalInvestedAmount = 0,
        totalInvestments = 0,
    } = investorSummary || {}

    const [dateRange, setDateRange] = useState("30")
    const [lastUpdated, setLastUpdated] = useState(null)

    const {
        totalCommission = 0,
        receivableAfterTDS = 0,
        pendingCommission = 0,
    } = commissionSummary || {}

    //   console.log("Dashboard data:", {
    //     commissionSummary,
    //     investorSummary,
    //     loading,
    //   })

    useEffect(() => {
        dispatch(fetchPartnerDashboardData())
        setLastUpdated(new Date())
    }, [dispatch])

    const handleRefresh = () => {
        dispatch(fetchPartnerDashboardData())
        setLastUpdated(new Date())
    }

    const handleExport = () => {
        console.log("Export dashboard data")
    }

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value)

    return (
        <div className="space-y-8 pb-10">

            {/* Header */}
            <header className="flex flex-col gap-5 border-b border-border/60 pb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Partner Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {lastUpdated
                                ? `Last updated: ${format(lastUpdated, "PPp")}`
                                : "Loading..."}
                        </p>
                    </div>

                    <div className="flex gap-3">

                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-[170px]">
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
                            onClick={handleRefresh}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4" />
                        </Button>

                    </div>
                </div>
            </header>

            {/* Metric Cards */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <MetricCard
                            title="Total Commission"
                            value={formatCurrency(totalCommission)}
                            icon={Percent}
                            iconColor="blue"
                        />

                        <MetricCard
                            title="Receivable After TDS"
                            value={formatCurrency(receivableAfterTDS)}
                            icon={Percent}
                            iconColor="green"
                        />

                        <MetricCard
                            title="Pending Commission"
                            value={formatCurrency(pendingCommission)}
                            icon={Percent}
                            iconColor="orange"
                        />

                        <MetricCard
                            title="Total Investors"
                            value={formatCurrency(totalInvestors)}
                            icon={Users}
                            iconColor="purple"
                        />

                        <MetricCard
                            title="Active Investors"
                            value={formatCurrency(activeInvestors)}
                            icon={Users}
                            iconColor="teal"
                        />

                        <MetricCard
                            title="Total Invested Amount"
                            value={formatCurrency(totalInvestedAmount)}
                            icon={TrendingUp}
                            iconColor="green"
                        />

                        <MetricCard
                            title="Total No. of Investments"
                            value={formatCurrency(totalInvestments)}
                            icon={BarChart3}
                            iconColor="orange"
                        />

                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

                        <CommissionComparisonChart
                            totalCommission={totalCommission}
                            pendingCommission={pendingCommission}
                        />

                        <InvestorInvestmentChart
                            totalInvestors={totalInvestors}
                            totalInvestments={totalInvestments}
                        />

                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-5">
                        <div className="">
                            <RecentInvestors investors={investors} />
                        </div>
                        <div>
                            {/* <GoalsSection /> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}