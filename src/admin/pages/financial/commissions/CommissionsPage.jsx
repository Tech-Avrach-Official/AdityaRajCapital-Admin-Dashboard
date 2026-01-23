import React, { useState, useEffect } from "react"
import { useMemo } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Eye } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import FilterBar from "@/components/common/FilterBar"
import StatusBadge from "@/components/common/StatusBadge"
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

const CommissionsPage = () => {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadCommissions()
  }, [searchValue, statusFilter])

  const loadCommissions = async () => {
    setLoading(true)
    try {
      const response = await financialService.getCommissions({
        search: searchValue,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      setCommissions(response.data)
    } catch (error) {
      toast.error("Failed to load commissions")
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
        header: "Commission ID",
        cell: ({ row }) => (
          <button className="text-primary hover:underline font-mono text-sm">
            {row.original.id}
          </button>
        ),
      },
      {
        accessorKey: "partnerName",
        header: "Partner",
      },
      {
        accessorKey: "investmentId",
        header: "Investment",
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-sm">{row.original.investmentId}</p>
            <p className="text-xs text-muted-foreground">{row.original.productName}</p>
          </div>
        ),
      },
      {
        accessorKey: "investorName",
        header: "Investor",
      },
      {
        accessorKey: "investmentAmount",
        header: "Investment Amount",
        cell: ({ row }) => formatCurrency(row.original.investmentAmount),
      },
      {
        accessorKey: "commissionRate",
        header: "Rate",
        cell: ({ row }) => `${row.original.commissionRate}%`,
      },
      {
        accessorKey: "commissionAmount",
        header: "Commission",
        cell: ({ row }) => formatCurrency(row.original.commissionAmount),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "paidDate",
        header: "Paid Date",
        cell: ({ row }) =>
          row.original.paidDate ? format(new Date(row.original.paidDate), "MMM dd, yyyy") : "-",
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
    data: commissions,
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
        { value: "paid", label: "Paid" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Commissions" />

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by Commission ID, Partner, Investment..."
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

export default CommissionsPage
