import React, { useState, useEffect, useMemo } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { MoreHorizontal, Eye, Edit, UserCog } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import FilterBar from "@/components/common/FilterBar"
import StatusBadge from "@/components/common/StatusBadge"
import ChangeRMModal from "./components/ChangeRMModal"
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
import { Skeleton } from "@/components/ui/skeleton"
import { usePartners } from "@/hooks"

const PartnersPage = () => {
  // Redux state and actions
  const {
    partners,
    filteredPartners,
    loading,
    filters,
    loadPartners,
    updateFilters,
    resetFilters,
  } = usePartners()

  // Change RM Modal state
  const [changeRMModalOpen, setChangeRMModalOpen] = useState(false)
  const [selectedPartnerForRM, setSelectedPartnerForRM] = useState(null)

  // Load partners on mount
  useEffect(() => {
    loadPartners()
  }, [loadPartners])

  // Handle filter changes
  const handleSearchChange = (value) => {
    updateFilters({ search: value })
  }

  const handleStatusChange = (value) => {
    updateFilters({ status: value })
    loadPartners({ status: value !== "all" ? value : undefined })
  }

  const handleClearFilters = () => {
    resetFilters()
    loadPartners()
  }

  // Open Change RM modal
  const handleChangeRM = (partner) => {
    setSelectedPartnerForRM(partner)
    setChangeRMModalOpen(true)
  }

  // Handle successful RM change
  const handleRMChangeSuccess = () => {
    loadPartners() // Refresh the list
    toast.success("Partner RM changed successfully")
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <button className="text-primary hover:underline font-medium text-left">
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.mobile}</span>
        ),
      },
      {
        accessorKey: "id",
        header: "Partner ID",
        cell: ({ row }) => {
          // Use partnerId if available, otherwise format the id
          const partnerId = row.original.partnerId || row.original.partner_id
          if (partnerId) {
            return <span className="font-mono text-sm">{partnerId}</span>
          }
          // Format numeric id as P-{id}
          const id = row.original.id
          return (
            <span className="font-mono text-sm">
              {id ? `P-${String(id).padStart(4, "0")}` : "-"}
            </span>
          )
        },
      },
      {
        accessorKey: "rm",
        header: "RM",
        cell: ({ row }) => {
          const partner = row.original
          const rmName = partner.rm?.rm_name || partner.rmName
          const rmCode = partner.rm?.rm_code || ""

          if (rmName) {
            return (
              <div>
                <p className="font-medium text-sm">{rmName}</p>
                {rmCode && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {rmCode}
                  </p>
                )}
              </div>
            )
          }
          return (
            <span className="text-muted-foreground italic text-sm">
              Unassigned
            </span>
          )
        },
      },
      {
        accessorKey: "investorsCount",
        header: "Investors",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.investorsCount ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "totalCommission",
        header: "Total Commission",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.original.totalCommission)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
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
              <DropdownMenuItem onClick={() => handleChangeRM(row.original)}>
                <UserCog className="mr-2 h-4 w-4" />
                Change RM
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  )

  // Use filtered partners for display
  const displayData = filters.search ? filteredPartners : partners

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const filterConfig = [
    {
      key: "status",
      value: filters.status,
      placeholder: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Partners" />

      <FilterBar
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name, email, Partner ID..."
        filters={filterConfig}
        onFilterChange={(key, value) => {
          if (key === "status") handleStatusChange(value)
        }}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <div className="rounded-md border p-4">
          <LoadingSkeleton />
        </div>
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
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No partners found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Change RM Modal */}
      <ChangeRMModal
        isOpen={changeRMModalOpen}
        onClose={() => {
          setChangeRMModalOpen(false)
          setSelectedPartnerForRM(null)
        }}
        partner={selectedPartnerForRM}
        onSuccess={handleRMChangeSuccess}
      />
    </div>
  )
}

export default PartnersPage
