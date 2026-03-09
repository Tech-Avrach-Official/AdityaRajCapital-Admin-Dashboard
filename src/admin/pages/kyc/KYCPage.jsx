import React, { useState, useEffect, useMemo } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Eye, CheckCircle, XCircle } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import FilterBar from "@/components/common/FilterBar"
import StatusBadge from "@/components/common/StatusBadge"
import MetricCard from "@/components/common/MetricCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { kycService } from "@/lib/api/services"
import KYCDocumentViewModal from "./components/KYCDocumentViewModal"

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "investor", label: "Investor" },
  { value: "partner", label: "Partner" },
]

const KYCPage = () => {
  const [kycList, setKycList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [roleFilter, setRoleFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0,
  })

  useEffect(() => {
    loadKYC()
  }, [searchValue, activeTab, roleFilter, dateFrom, dateTo])

  const loadKYC = async () => {
    setLoading(true)
    try {
      const status = activeTab === "all" ? undefined : activeTab
      const response = await kycService.getKYCList({
        search: searchValue,
        status,
        role: roleFilter,
        type: roleFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      setKycList(response.data)

      const pending = response.data.filter((k) => k.status === "pending").length
      const verified = response.data.filter((k) => k.status === "verified").length
      const rejected = response.data.filter((k) => k.status === "rejected").length

      setStats({
        pending,
        verified,
        rejected,
        total: response.data.length,
      })
    } catch (error) {
      toast.error("Failed to load KYC list")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocuments = (row) => {
    setSelectedRow(row)
    setDocumentModalOpen(true)
  }

  const handleCloseDocumentModal = () => {
    setDocumentModalOpen(false)
    setSelectedRow(null)
  }

  const onFilterChange = (key, value) => {
    if (key === "role") setRoleFilter(value)
    if (key === "dateFrom") setDateFrom(value)
    if (key === "dateTo") setDateTo(value)
  }

  const onClearFilters = () => {
    setSearchValue("")
    setRoleFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "userName",
        header: "User Name",
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => handleViewDocuments(row.original)}
          >
            {row.original.userName}
          </button>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="capitalize rounded bg-muted px-2 py-1 text-sm">
            {row.original.role}
          </span>
        ),
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "submittedDate",
        header: "Submitted Date",
        cell: ({ row }) =>
          row.original.submittedDate
            ? format(new Date(row.original.submittedDate), "MMM dd, yyyy")
            : "—",
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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDocuments(row.original)}
              title="View KYC documents"
            >
              <Eye className="h-4 w-4" />
              View documents
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: kycList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="KYC Verification" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Pending" value={stats.pending} icon={Eye} iconColor="orange" />
        <MetricCard
          title="Verified"
          value={stats.verified}
          icon={CheckCircle}
          iconColor="green"
        />
        <MetricCard title="Rejected" value={stats.rejected} icon={XCircle} iconColor="red" />
        <MetricCard title="Total" value={stats.total} icon={Eye} iconColor="blue" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Search by name, email, mobile..."
            filters={[
              {
                key: "role",
                value: roleFilter,
                placeholder: "Role",
                options: ROLE_OPTIONS,
              },
            ]}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />

          {/* Date range filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white p-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded border border-input bg-background px-3 py-1.5 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded border border-input bg-background px-3 py-1.5 text-sm"
              />
            </label>
          </div>

          {loading ? (
            <div className="py-8 text-center">Loading...</div>
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
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <KYCDocumentViewModal
        open={documentModalOpen}
        onClose={handleCloseDocumentModal}
        row={selectedRow}
      />
    </div>
  )
}

export default KYCPage
