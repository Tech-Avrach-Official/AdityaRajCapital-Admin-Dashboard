import React, { useState, useEffect } from "react"
import { useMemo } from "react"
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

const KYCPage = () => {
  const [kycList, setKycList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0,
  })

  useEffect(() => {
    loadKYC()
  }, [searchValue, activeTab])

  const loadKYC = async () => {
    setLoading(true)
    try {
      const status = activeTab === "all" ? undefined : activeTab
      const response = await kycService.getKYCList({
        search: searchValue,
        status,
      })
      setKycList(response.data)

      // Calculate stats
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

  const handleVerify = async (id) => {
    try {
      await kycService.verifyKYC(id)
      toast.success("KYC verified successfully")
      loadKYC()
    } catch (error) {
      toast.error("Failed to verify KYC")
    }
  }

  const handleReject = async (id, reason) => {
    try {
      await kycService.rejectKYC(id, reason)
      toast.success("KYC rejected")
      loadKYC()
    } catch (error) {
      toast.error("Failed to reject KYC")
    }
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "userName",
        header: "User Name",
        cell: ({ row }) => (
          <button className="text-primary hover:underline font-medium">
            {row.original.userName}
          </button>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="capitalize px-2 py-1 bg-muted rounded text-sm">
            {row.original.role}
          </span>
        ),
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "submittedDate",
        header: "Submitted Date",
        cell: ({ row }) => format(new Date(row.original.submittedDate), "MMM dd, yyyy"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "documents",
        header: "Documents",
        cell: () => <span className="text-sm">5 documents</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info("KYC Review Modal - To be implemented")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {row.original.status === "pending" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVerify(row.original.id)}
                  className="text-success"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleReject(row.original.id, "Rejected by admin")
                  }
                  className="text-destructive"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            searchPlaceholder="Search by name, email..."
            onClearFilters={() => setSearchValue("")}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default KYCPage
