import React, { useState, useEffect } from "react"
import { useMemo } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Download } from "lucide-react"
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
import { mockAuditLogs } from "@/lib/mockData/audit"

const AuditPage = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    loadAuditLogs()
  }, [searchValue])

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      let filtered = [...mockAuditLogs]

      if (searchValue) {
        const search = searchValue.toLowerCase()
        filtered = filtered.filter(
          (log) =>
            log.user.toLowerCase().includes(search) ||
            log.action.toLowerCase().includes(search) ||
            log.entity.toLowerCase().includes(search)
        )
      }

      setAuditLogs(filtered)
    } catch (error) {
      toast.error("Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    toast.info("Export functionality - To be implemented")
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) =>
          format(new Date(row.original.timestamp), "MMM dd, yyyy HH:mm:ss"),
      },
      { accessorKey: "user", header: "User" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="capitalize px-2 py-1 bg-muted rounded text-sm">
            {row.original.role}
          </span>
        ),
      },
      { accessorKey: "action", header: "Action" },
      { accessorKey: "entity", header: "Entity" },
      {
        accessorKey: "entityId",
        header: "Entity ID",
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.entityId}</span>
        ),
      },
      {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {JSON.stringify(row.original.details).substring(0, 50)}...
          </span>
        ),
      },
      { accessorKey: "ipAddress", header: "IP Address" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  )

  const table = useReactTable({
    data: auditLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        action="Export"
        onActionClick={handleExport}
      />

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by user, action, entity..."
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
    </div>
  )
}

export default AuditPage
