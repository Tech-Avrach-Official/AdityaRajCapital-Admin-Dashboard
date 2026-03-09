import React, { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Download, Search } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import StatusBadge from "@/components/common/StatusBadge"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usersService, hierarchyService } from "@/lib/api/services"
import { cn } from "@/lib/utils"

const formatINR = (amount) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—")

const InvestorsPage = () => {
  const navigate = useNavigate()
  const [investors, setInvestors] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [kycFilter, setKycFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [exporting, setExporting] = useState(false)
  const [sorting, setSorting] = useState([])

  useEffect(() => {
    hierarchyService.getBranches().then(({ branches: list }) => setBranches(list ?? [])).catch(() => setBranches([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    const branchId = branchFilter && branchFilter !== "all" ? branchFilter : undefined
    usersService
      .getInvestors({ branch_id: branchId })
      .then((res) => setInvestors(res?.data ?? []))
      .catch(() => {
        toast.error("Failed to load investors")
        setInvestors([])
      })
      .finally(() => setLoading(false))
  }, [branchFilter])

  const filteredInvestors = useMemo(() => {
    let list = [...investors]
    const q = searchValue.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (i) =>
          (i.client_id && String(i.client_id).toLowerCase().includes(q)) ||
          (i.name && i.name.toLowerCase().includes(q)) ||
          (i.email && i.email.toLowerCase().includes(q))
      )
    }
    if (kycFilter !== "all") {
      list = list.filter((i) => (i.kyc_status || "").toLowerCase() === kycFilter.toLowerCase())
    }
    return list
  }, [investors, searchValue, kycFilter])

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      const headers = [
        "Client ID",
        "Name",
        "Branch",
        "Referral",
        "KYC",
        "Total Invested",
        "Verified Count",
        "Last Verified",
        "Created",
      ]
      const rows = filteredInvestors.map((i) =>
        [
          i.client_id,
          i.name,
          i.branch_name ?? "",
          i.referral,
          i.kyc_status,
          i.total_invested ?? "",
          i.verified_count ?? "",
          i.last_verified ?? "",
          i.created ?? "",
        ].join(",")
      )
      const csv = [headers.join(","), ...rows].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `investors-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setExporting(false)
    }, 400)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "client_id",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Client ID
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.client_id || "—"}</span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left font-medium text-primary hover:underline"
            onClick={() =>
              navigate(`/admin/users/investors/${row.original.id}`, {
                state: { investor: row.original },
              })
            }
          >
            {row.original.name || "—"}
          </button>
        ),
      },
      {
        accessorKey: "branch_name",
        header: "Branch",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.branch_name || "—"}</span>
        ),
      },
      {
        accessorKey: "referral",
        header: "Referral",
        cell: ({ row }) => {
          const { referral, referral_type } = row.original
          return (
            <div className="flex flex-wrap items-center gap-2">
              {referral_type === "partner" && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                  Partner
                </Badge>
              )}
              {referral_type === "rm" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
                  RM
                </Badge>
              )}
              <span className="text-sm">{referral || "Direct"}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "kyc_status",
        header: "KYC",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.kyc_status === "complete" ? "verified" : "pending"}
            customLabel={row.original.kyc_status === "complete" ? "Complete" : "Pending"}
          />
        ),
      },
      {
        accessorKey: "total_invested",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total invested
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatINR(row.original.total_invested)}</span>
        ),
      },
      {
        accessorKey: "verified_count",
        header: "Verified count",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.verified_count ?? "—"}</span>
        ),
      },
      {
        accessorKey: "last_verified",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last verified
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(row.original.last_verified)}
          </span>
        ),
      },
      {
        accessorKey: "created",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{formatDate(row.original.created)}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              navigate(`/admin/users/investors/${row.original.id}`, {
                state: { investor: row.original },
              })
            }
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        ),
      },
    ],
    [navigate]
  )

  const table = useReactTable({
    data: filteredInvestors,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Investors" />

      {/* Toolbar */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Client ID or name..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="KYC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">KYC Pending</SelectItem>
              <SelectItem value="complete">KYC Complete</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="default"
            className="gap-2"
            onClick={handleExport}
            disabled={exporting || filteredInvestors.length === 0}
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export"}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredInvestors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-lg font-medium text-foreground">No investors found</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Try clearing filters or search to see all investors.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchValue("")
                setKycFilter("all")
                setBranchFilter("all")
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      idx % 2 === 1 && "bg-muted/20"
                    )}
                    onClick={(e) => {
                      if (!e.target.closest("button")) {
                        navigate(`/admin/users/investors/${row.original.id}`, {
                          state: { investor: row.original },
                        })
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvestorsPage
