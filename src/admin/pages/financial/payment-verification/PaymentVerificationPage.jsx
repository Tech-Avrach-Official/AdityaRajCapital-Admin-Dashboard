import React, { useEffect, useMemo, useState } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Eye, CheckCircle, XCircle, CreditCard, IndianRupee, Loader2, Download } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import FilterBar from "@/components/common/FilterBar"
import MetricCard from "@/components/common/MetricCard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { usePurchases } from "@/hooks"
import PaymentProofModal from "./components/PaymentProofModal"
import RejectPaymentModal from "./components/RejectPaymentModal"
import ApprovePaymentModal from "./components/ApprovePaymentModal"

/**
 * Format currency in INR
 */
const formatINR = (amount) => {
  const num = Number(amount)
  const safeAmount = Number.isFinite(num) ? num : 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeAmount)
}

const PaymentVerificationPage = () => {
  const {
    pendingPurchases,
    filteredPurchases,
    loading,
    verifying,
    rejecting,
    pendingCount,
    summary,
    processingId,
    loadPending,
    verifyPayment,
    rejectPayment,
    updateFilters,
    filters,
    isPurchaseProcessing,
  } = usePurchases()

  const [searchValue, setSearchValue] = useState("")
  const [proofModalOpen, setProofModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [approveError, setApproveError] = useState(null) // { message, error_code } for VAL_001 etc.

  // Load pending verifications on mount
  useEffect(() => {
    loadPending()
  }, [loadPending])

  // Update filters when search changes
  useEffect(() => {
    updateFilters({ search: searchValue })
  }, [searchValue, updateFilters])

  // Handle view proof
  const handleViewProof = (purchase) => {
    setSelectedPurchase(purchase)
    setProofModalOpen(true)
  }

  // Helper: get user-facing error message from reject/verify payload (string or { message, error_code })
  const getErrorMessage = (payload) =>
    payload && typeof payload === "object" && "message" in payload ? payload.message : payload

  // Open approve modal
  const handleApproveClick = (purchase) => {
    setApproveError(null)
    setSelectedPurchase(purchase)
    setApproveModalOpen(true)
  }

  // Handle approve submission from modal (with cheque number)
  const handleApproveSubmit = async ({ cheque_number }) => {
    if (!selectedPurchase) return
    setApproveError(null)
    try {
      const result = await verifyPayment(selectedPurchase.id, cheque_number)
      if (result.meta?.requestStatus === "fulfilled") {
        toast.success("Payment verified successfully")
        setApproveModalOpen(false)
        setSelectedPurchase(null)
      } else {
        const payload = result.payload
        const message = getErrorMessage(payload)
        toast.error(message || "Failed to verify payment")
        if (payload?.error_code === "VAL_001") {
          setApproveError(payload.message || "Cheque number is required when approving payment")
        }
      }
    } catch (error) {
      toast.error("Failed to verify payment")
    }
  }

  // Handle reject click - open modal
  const handleRejectClick = (purchase) => {
    setSelectedPurchase(purchase)
    setRejectModalOpen(true)
  }

  // Handle reject submission from modal
  const handleRejectSubmit = async ({ reason }) => {
    if (!selectedPurchase) return

    try {
      const result = await rejectPayment(selectedPurchase.id, reason)
      if (result.meta?.requestStatus === "fulfilled") {
        toast.success("Payment rejected successfully")
        setRejectModalOpen(false)
        setSelectedPurchase(null)
      } else {
        toast.error(getErrorMessage(result.payload) || "Failed to reject payment")
      }
    } catch (error) {
      toast.error("Failed to reject payment")
    }
  }

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Purchase ID",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-primary">
            {row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "investor_id",
        header: "Investor ID",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.investor_id}
          </span>
        ),
      },
      {
        accessorKey: "investor_name",
        header: "Investor Name",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.investor_name || "-"}</p>
            <p className="text-xs text-muted-foreground">{row.original.investor_email || ""}</p>
          </div>
        ),
      },
      {
        accessorKey: "plan_name",
        header: "Plan Name",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.plan_name}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-green-600">
            {formatINR(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "payment_proof_uploaded_at",
        header: "Uploaded At",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.payment_proof_uploaded_at
              ? format(new Date(row.original.payment_proof_uploaded_at), "MMM dd, yyyy HH:mm")
              : "-"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const purchase = row.original
          const isProcessing = isPurchaseProcessing(purchase.id)

          return (
            <div className="flex items-center gap-2">
              {/* View Proof */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewProof(purchase)}
                title="View Payment Proof"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {/* Approve */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApproveClick(purchase)}
                disabled={isProcessing}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Approve Payment"
              >
                {isProcessing && verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>

              {/* Reject */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRejectClick(purchase)}
                disabled={isProcessing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Reject Payment"
              >
                {isProcessing && rejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
          )
        },
      },
    ],
    [isPurchaseProcessing, verifying, rejecting]
  )

  // Setup table
  const table = useReactTable({
    data: filteredPurchases,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleExport = () => {
    if (!filteredPurchases?.length) {
      toast.error("No payments to export")
      return
    }
    const escapeCsvCell = (val) => {
      const s = String(val ?? "")
      if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const headers = [
      "Purchase ID",
      "Investor ID",
      "Investor Name",
      "Investor Email",
      "Plan Name",
      "Amount",
      "Uploaded At",
    ]
    const rows = filteredPurchases.map((p) => [
      String(p.id ?? ""),
      String(p.investor_id ?? ""),
      p.investor_name ?? "",
      p.investor_email ?? "",
      p.plan_name ?? "",
      formatINR(p.amount),
      p.payment_proof_uploaded_at
        ? format(new Date(p.payment_proof_uploaded_at), "yyyy-MM-dd HH:mm")
        : "",
    ])
    const csvRows = [headers.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))]
    const csv = "\uFEFF" + csvRows.join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payment-verification-export-${new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Payments exported successfully")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Verification"
        description="Review and verify payment proofs for plan purchases"
      />

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Pending Verifications"
          value={pendingCount}
          icon={CreditCard}
          iconColor="orange"
        />
        <MetricCard
          title="Total Pending Amount"
          value={formatINR(summary?.totalAmount ?? 0)}
          icon={IndianRupee}
          iconColor="green"
          valueClassName="text-lg"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search by ID, investor, plan, or amount..."
          onClearFilters={() => setSearchValue("")}
        />
        <Button
          variant="outline"
          size="default"
          className="gap-2 shrink-0"
          onClick={handleExport}
          disabled={!filteredPurchases?.length}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading pending verifications...</span>
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
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-8 w-8" />
                      <p>No pending payment verifications</p>
                      <p className="text-sm">All payments have been processed</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Payment Proof Modal */}
      <PaymentProofModal
        isOpen={proofModalOpen}
        onClose={() => {
          setProofModalOpen(false)
          setSelectedPurchase(null)
        }}
        purchase={selectedPurchase}
      />

      {/* Approve Payment Modal */}
      <ApprovePaymentModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false)
          setSelectedPurchase(null)
          setApproveError(null)
        }}
        purchase={selectedPurchase}
        onApprove={handleApproveSubmit}
        isLoading={verifying}
        chequeError={approveError}
      />

      {/* Reject Payment Modal */}
      <RejectPaymentModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false)
          setSelectedPurchase(null)
        }}
        purchase={selectedPurchase}
        onReject={handleRejectSubmit}
        isLoading={rejecting}
      />
    </div>
  )
}

export default PaymentVerificationPage
