import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { Eye, Download, Search, X } from "lucide-react"
import { toast } from "react-hot-toast"
import PageHeader from "@/components/common/PageHeader"
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
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usePartners } from "@/hooks"
import { hierarchyService, usersService } from "@/lib/api/services"

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
  const [rms, setRms] = useState([])
  const [createdFrom, setCreatedFrom] = useState("")
  const [createdTo, setCreatedTo] = useState("")
  const [minInvestors, setMinInvestors] = useState("")
  const [maxInvestors, setMaxInvestors] = useState("")
  const [minCommission, setMinCommission] = useState("")
  const [maxCommission, setMaxCommission] = useState("")

  // Load branches on mount
  useEffect(() => {
    hierarchyService.getBranches().then(({ branches: list }) => setBranches(list ?? []))
  }, [])

  // Load RMs for Referral RM filter
  useEffect(() => {
    usersService
      .getRMs({ limit: 500 })
      .then((res) => setRms(res?.data ?? []))
      .catch(() => setRms([]))
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
    const emptyVal = key === "branch_id" ? "" : key === "rmId" ? null : "all"
    const val = value === "all" || value === "" ? emptyVal : value
    updateFilters({ [key]: val })
    const branchId = key === "branch_id" ? (value || undefined) : (filters.branch_id || undefined)
    const status = key === "status" ? (value !== "all" ? value : undefined) : (filters.status !== "all" ? filters.status : undefined)
    const kycStatus = key === "kycStatus" ? (value !== "all" ? value : undefined) : (filters.kycStatus !== "all" ? filters.kycStatus : undefined)
    const rmId = key === "rmId" ? (value && value !== "all" ? Number(value) : undefined) : (filters.rmId != null && filters.rmId !== "" ? Number(filters.rmId) : undefined)
    loadPartners({
      branch_id: branchId,
      status,
      kycStatus,
      rmId,
    })
  }

  const handleClearFilters = () => {
    resetFilters()
    setCreatedFrom("")
    setCreatedTo("")
    setMinInvestors("")
    setMaxInvestors("")
    setMinCommission("")
    setMaxCommission("")
    loadPartners()
  }

  const handleExport = () => {
    const data = displayData
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

  // Apply client-side filters (date range, min/max investors, min/max commission)
  const displayData = useMemo(() => {
    const base = filteredPartners
    let list = [...base]
    if (createdFrom) {
      const from = new Date(createdFrom)
      from.setHours(0, 0, 0, 0)
      list = list.filter((p) => {
        const d = p.created_at ?? p.createdAt
        if (!d) return false
        return new Date(d) >= from
      })
    }
    if (createdTo) {
      const to = new Date(createdTo)
      to.setHours(23, 59, 59, 999)
      list = list.filter((p) => {
        const d = p.created_at ?? p.createdAt
        if (!d) return false
        return new Date(d) <= to
      })
    }
    const minInv = minInvestors.trim() ? parseInt(minInvestors.replace(/,/g, ""), 10) : null
    if (minInv != null && !Number.isNaN(minInv)) {
      list = list.filter((p) => {
        const n = p.referral_summary?.referred_investors_count ?? p.investorsCount ?? 0
        return Number(n) >= minInv
      })
    }
    const maxInv = maxInvestors.trim() ? parseInt(maxInvestors.replace(/,/g, ""), 10) : null
    if (maxInv != null && !Number.isNaN(maxInv)) {
      list = list.filter((p) => {
        const n = p.referral_summary?.referred_investors_count ?? p.investorsCount ?? 0
        return Number(n) <= maxInv
      })
    }
    const minComm = minCommission.trim() ? parseFloat(minCommission.replace(/,/g, ""), 10) : null
    if (minComm != null && !Number.isNaN(minComm)) {
      list = list.filter((p) => {
        const c = p.total_commission ?? p.totalCommission ?? 0
        return Number(c) >= minComm
      })
    }
    const maxComm = maxCommission.trim() ? parseFloat(maxCommission.replace(/,/g, ""), 10) : null
    if (maxComm != null && !Number.isNaN(maxComm)) {
      list = list.filter((p) => {
        const c = p.total_commission ?? p.totalCommission ?? 0
        return Number(c) <= maxComm
      })
    }
    return list
  }, [filteredPartners, createdFrom, createdTo, minInvestors, maxInvestors, minCommission, maxCommission])

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, Partner ID..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Referral RM</label>
            <Select
              value={filters.rmId != null && filters.rmId !== "" ? String(filters.rmId) : "all"}
              onValueChange={(v) => handleFilterChange("rmId", v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All RMs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All RMs</SelectItem>
                {rms.map((rm) => (
                  <SelectItem key={rm.id} value={String(rm.id)}>
                    {rm.rm_name ?? rm.name ?? `RM ${rm.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Created from</label>
            <Input
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Created to</label>
            <Input
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Min investors</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={minInvestors}
              onChange={(e) => setMinInvestors(e.target.value)}
              className="w-[110px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Max investors</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="—"
              value={maxInvestors}
              onChange={(e) => setMaxInvestors(e.target.value)}
              className="w-[110px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Min commission (₹)</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={minCommission}
              onChange={(e) => setMinCommission(e.target.value)}
              className="w-[130px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Max commission (₹)</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="—"
              value={maxCommission}
              onChange={(e) => setMaxCommission(e.target.value)}
              className="w-[130px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Branch</label>
            <Select
              value={filters.branch_id || "all"}
              onValueChange={(v) => handleFilterChange("branch_id", v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">KYC Status</label>
            <Select
              value={filters.kycStatus || "all"}
              onValueChange={(v) => handleFilterChange("kycStatus", v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Status</label>
            <Select
              value={filters.status || "all"}
              onValueChange={(v) => handleFilterChange("status", v)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="default" onClick={handleClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        </div>
      </div>

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
