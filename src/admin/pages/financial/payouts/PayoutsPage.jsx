import React, { useState, useEffect } from "react"
import { useMemo } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Upload, Eye } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import FilterBar from "@/components/common/FilterBar"
import StatusBadge from "@/components/common/StatusBadge"
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
import { financialService } from "@/lib/api/services"

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    loadPayouts()
  }, [searchValue, activeTab])

  const loadPayouts = async () => {
    setLoading(true)
    try {
      const status = activeTab === "all" ? undefined : activeTab
      const response = await financialService.getPayouts({
        search: searchValue,
        status,
      })
      setPayouts(response.data)
    } catch (error) {
      toast.error("Failed to load payouts")
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

  const handleUploadPDF = () => {
    toast.info("Upload Bank PDF - To be implemented with file upload modal")
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Payout ID",
        cell: ({ row }) => (
          <button className="text-primary hover:underline font-mono text-sm">
            {row.original.id}
          </button>
        ),
      },
      {
        accessorKey: "investorName",
        header: "Investor",
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
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => format(new Date(row.original.dueDate), "MMM dd, yyyy"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "crnNumber",
        header: "CRN Number",
        cell: ({ row }) => row.original.crnNumber || "-",
      },
      {
        accessorKey: "processedDate",
        header: "Processed Date",
        cell: ({ row }) =>
          row.original.processedDate
            ? format(new Date(row.original.processedDate), "MMM dd, yyyy")
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
    data: payouts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payout Management"
        action="Upload Bank PDF"
        onActionClick={handleUploadPDF}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Search by Payout ID, Investor..."
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

export default PayoutsPage
