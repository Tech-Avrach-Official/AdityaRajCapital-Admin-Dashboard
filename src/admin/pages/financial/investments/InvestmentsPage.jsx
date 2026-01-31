import React, { useState, useEffect } from "react"
import { useMemo } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Eye } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import FilterBar from "@/components/common/FilterBar"
import StatusBadge from "@/components/common/StatusBadge"
import MetricCard from "@/components/common/MetricCard"
import { DollarSign, Activity, CheckCircle, Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { financialService } from "@/lib/api/services"

const InvestmentsPage = () => {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [summary, setSummary] = useState({
    total: { count: 0, amount: 0 },
    active: { count: 0, amount: 0 },
    completed: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
  })

  useEffect(() => {
    loadInvestments()
  }, [searchValue, statusFilter])

  const loadInvestments = async () => {
    setLoading(true)
    try {
      const response = await financialService.getInvestments({
        search: searchValue,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      setInvestments(response.data)

      // Calculate summary
      const total = response.data.reduce(
        (acc, inv) => ({ count: acc.count + 1, amount: acc.amount + inv.amount }),
        { count: 0, amount: 0 }
      )
      const active = response.data
        .filter((inv) => inv.status === "active")
        .reduce(
          (acc, inv) => ({ count: acc.count + 1, amount: acc.amount + inv.amount }),
          { count: 0, amount: 0 }
        )
      const completed = response.data
        .filter((inv) => inv.status === "completed")
        .reduce(
          (acc, inv) => ({ count: acc.count + 1, amount: acc.amount + inv.amount }),
          { count: 0, amount: 0 }
        )
      const pending = response.data
        .filter((inv) => inv.status === "pending")
        .reduce(
          (acc, inv) => ({ count: acc.count + 1, amount: acc.amount + inv.amount }),
          { count: 0, amount: 0 }
        )

      setSummary({ total, active, completed, pending })
    } catch (error) {
      toast.error("Failed to load investments")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Investment ID",
        cell: ({ row }) => (
          <button className="text-primary hover:underline font-mono text-sm">
            {row.original.id}
          </button>
        ),
      },
      {
        accessorKey: "investorName",
        header: "Investor",
        cell: ({ row }) => (
          <button className="text-primary hover:underline">
            {row.original.investorName || row.original.investorId || "-"}
          </button>
        ),
      },
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => (
          <button className="text-primary hover:underline">
            {row.original.productName || row.original.planName || "-"}
          </button>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
          row.original.date
            ? format(new Date(row.original.date), "MMM dd, yyyy")
            : "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "expectedReturns",
        header: "Expected Returns",
        cell: ({ row }) => formatCurrency(row.original.expectedReturns),
      },
      {
        accessorKey: "nextPayout",
        header: "Next Payout",
        cell: ({ row }) =>
          row.original.nextPayout
            ? format(new Date(row.original.nextPayout), "MMM dd, yyyy")
            : "-",
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: investments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const filters = [
    {
      key: "status",
      value: statusFilter,
      placeholder: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="All Investments" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Investments"
          value={summary.total.count}
          subtitle={formatCurrency(summary.total.amount)}
          icon={DollarSign}
          iconColor="blue"
        />
        <MetricCard
          title="Active Investments"
          value={summary.active.count}
          subtitle={formatCurrency(summary.active.amount)}
          icon={Activity}
          iconColor="green"
        />
        <MetricCard
          title="Completed Investments"
          value={summary.completed.count}
          subtitle={formatCurrency(summary.completed.amount)}
          icon={CheckCircle}
          iconColor="purple"
        />
        <MetricCard
          title="Pending Investments"
          value={summary.pending.count}
          subtitle={formatCurrency(summary.pending.amount)}
          icon={Clock}
          iconColor="orange"
        />
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by Investment ID, Investor, Product..."
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "status") setStatusFilter(value)
        }}
        onClearFilters={() => {
          setSearchValue("")
          setStatusFilter("all")
        }}
      />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default InvestmentsPage
