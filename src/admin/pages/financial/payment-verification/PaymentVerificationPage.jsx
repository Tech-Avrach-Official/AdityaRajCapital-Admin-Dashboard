import React, { useEffect, useMemo, useState } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Eye, CheckCircle, XCircle, CreditCard, IndianRupee, Loader2 } from "lucide-react"
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
  const [selectedPurchase, setSelectedPurchase] = useState(null)

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

  // Handle approve payment
  const handleApprove = async (purchaseId) => {
    try {
      const result = await verifyPayment(purchaseId)
      if (result.meta?.requestStatus === "fulfilled") {
        toast.success("Payment verified successfully")
      } else {
        toast.error(result.payload || "Failed to verify payment")
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
        toast.error(result.payload || "Failed to reject payment")
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
                onClick={() => handleApprove(purchase.id)}
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
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by ID, investor, plan, or amount..."
        onClearFilters={() => setSearchValue("")}
      />

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
