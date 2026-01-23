import React, { useState, useEffect } from "react"
import { useMemo } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { MoreHorizontal, Eye, Edit } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usersService } from "@/lib/api/services"

const InvestorsPage = () => {
  const [investors, setInvestors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [kycStatusFilter, setKycStatusFilter] = useState("all")

  useEffect(() => {
    loadInvestors()
  }, [searchValue, kycStatusFilter])

  const loadInvestors = async () => {
    setLoading(true)
    try {
      const response = await usersService.getInvestors({
        search: searchValue,
        kycStatus: kycStatusFilter !== "all" ? kycStatusFilter : undefined,
      })
      setInvestors(response.data)
    } catch (error) {
      toast.error("Failed to load investors")
    } finally {
      setLoading(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <button className="text-primary hover:underline font-medium">
            {row.original.name}
          </button>
        ),
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "mobile", header: "Mobile" },
      { accessorKey: "investorId", header: "Investor ID" },
      {
        accessorKey: "partnerName",
        header: "Partner",
        cell: ({ row }) => row.original.partnerName || "Direct",
      },
      {
        accessorKey: "kycStatus",
        header: "KYC Status",
        cell: ({ row }) => <StatusBadge status={row.original.kycStatus} />,
      },
      { accessorKey: "totalInvestments", header: "Investments" },
      {
        accessorKey: "totalInvested",
        header: "Total Invested",
        cell: ({ row }) =>
          new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(row.original.totalInvested),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: investors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const filters = [
    {
      key: "kycStatus",
      value: kycStatusFilter,
      placeholder: "KYC Status",
      options: [
        { value: "all", label: "All" },
        { value: "verified", label: "Verified" },
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Investors" />

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by name, email, Investor ID..."
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "kycStatus") setKycStatusFilter(value)
        }}
        onClearFilters={() => {
          setSearchValue("")
          setKycStatusFilter("all")
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

export default InvestorsPage
