import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { Eye, Download } from "lucide-react"
import { toast } from "react-hot-toast"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { usePartners } from "@/hooks"
import { hierarchyService } from "@/lib/api/services"

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

  const [branches, setBranches] = useState([])

  // Load branches on mount
  useEffect(() => {
    hierarchyService.getBranches().then(({ branches: list }) => setBranches(list ?? []))
  }, [])

  // Load partners on mount
  useEffect(() => {
    loadPartners()
  }, [loadPartners])

  // Handle filter changes
  const handleSearchChange = (value) => {
    updateFilters({ search: value })
  }

  const handleFilterChange = (key, value) => {
    if (key === "status") {
      updateFilters({ status: value })
      loadPartners({
        status: value !== "all" ? value : undefined,
        branch_id: filters.branch_id || undefined,
      })
      return
    }
    if (key === "branch_id") {
      updateFilters({ branch_id: value })
      loadPartners({
        status: filters.status !== "all" ? filters.status : undefined,
        branch_id: value || undefined,
      })
    }
  }

  const handleClearFilters = () => {
    resetFilters()
    loadPartners()
  }

  const handleExport = () => {
    const data = filters.search ? filteredPartners : partners
    if (!data || data.length === 0) {
      toast.error("No partners to export")
      return
    }
    const headers = [
      "Partner Referral Code",
      "Name",
      "Email",
      "Mobile",
      "Branch",
      "Referral RM",
      "KYC Status",
      "Total Investors",
      "Total Commission",
      "Created At",
    ]
    const rows = data.map((p) => {
      const branchName = p.branch?.name ?? p.branch_name ?? ""
      const rmName = p.rm?.rm_name ?? p.rmName ?? ""
      const kycStatus = p.kyc_status ?? ""
      const totalInvestors =
        p.referral_summary?.referred_investors_count ?? p.investorsCount ?? 0
      const totalCommission = p.total_commission ?? p.totalCommission ?? 0
      const createdAt = p.created_at ?? p.createdAt ?? ""
      const createdFormatted = createdAt
        ? new Date(createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })
        : ""
      const commissionFormatted = formatCurrency(totalCommission)
      return [
        p.partner_referral_code ?? p.referral_code ?? "",
        p.name ?? "",
        p.email ?? "",
        p.mobile ?? "",
        branchName,
        rmName,
        kycStatus,
        String(totalInvestors),
        commissionFormatted,
        createdFormatted,
      ]
    })
    const escapeCsvCell = (val) => {
      const s = String(val ?? "")
      if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const csvRows = [headers.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))]
    const csv = "\uFEFF" + csvRows.join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `partners-export-${new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Partners exported successfully")
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        dateStyle: "medium",
      })
    } catch {
      return "—"
    }
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "partner_referral_code",
        header: "Partner Referral Code",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.partner_referral_code ?? row.original.referral_code ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const p = row.original
          const name = p.name ?? "—"
          const img = p.profile_image
          const initial = name !== "—" ? name.charAt(0).toUpperCase() : "?"
          return (
            <Link
              to={`/admin/users/partners/${p.id}`}
              className="flex items-center gap-3 text-primary hover:underline font-medium text-left"
            >
              <Avatar className="h-9 w-9 shrink-0">
                {img && <AvatarImage src={img} alt={name} />}
                <AvatarFallback className="text-xs">{initial}</AvatarFallback>
              </Avatar>
              <span>{name}</span>
            </Link>
          )
        },
      },
      {
        accessorKey: "branch",
        header: "Branch",
        cell: ({ row }) => {
          const branch = row.original.branch
          if (!branch) return <span className="text-sm text-muted-foreground">—</span>
          const label = branch.name ?? branch.branch_name
          return (
            <span className="text-sm text-muted-foreground">
              {label ?? "—"}
            </span>
          )
        },
      },
      {
        accessorKey: "rm",
        header: "Referral RM",
        cell: ({ row }) => {
          const rmName = row.original.rm?.rm_name ?? row.original.rmName
          if (rmName) {
            return <span className="text-sm font-medium">{rmName}</span>
          }
          return (
            <span className="text-muted-foreground italic text-sm">Unassigned</span>
          )
        },
      },
      {
        accessorKey: "kyc_status",
        header: "KYC Status",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.kyc_status}
            customLabel={
              row.original.kyc_status
                ? row.original.kyc_status.charAt(0).toUpperCase() +
                  row.original.kyc_status.slice(1)
                : "—"
            }
          />
        ),
      },
      {
        accessorKey: "referral_summary",
        header: "Total Investors",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.referral_summary?.referred_investors_count ??
              row.original.investorsCount ??
              0}
          </span>
        ),
      },
      {
        accessorKey: "total_commission",
        header: "Total Commission",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(
              row.original.total_commission ?? row.original.totalCommission
            )}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at ?? row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const id = row.original.id
          return (
            <Button variant="ghost" size="sm" asChild>
              <Link
                to={`/admin/users/partners/${id}`}
                className="inline-flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>
            </Button>
          )
        },
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
    {
      key: "branch_id",
      value: filters.branch_id || "all",
      placeholder: "Branch",
      options: [
        { value: "all", label: "All Branches" },
        ...(branches.map((b) => ({ value: String(b.id), label: b.name })) ?? []),
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
      <PageHeader
        title="Partners"
        action="Export"
        actionLabel={
          <>
            <Download className="mr-2 h-4 w-4" />
            Export
          </>
        }
        onActionClick={handleExport}
      />

      <FilterBar
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name, email, Partner ID..."
        filters={filterConfig}
        onFilterChange={handleFilterChange}
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
    </div>
  )
}

export default PartnersPage
