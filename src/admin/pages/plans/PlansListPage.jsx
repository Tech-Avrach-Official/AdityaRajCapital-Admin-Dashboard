import React, { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import toast from "react-hot-toast"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { plansService } from "@/lib/api/services"
import { handleApiError } from "@/lib/utils/errorHandler"
import DeletePlanModal from "./components/DeletePlanModal"

const formatCurrency = (amount) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const PlansListPage = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [deleteModalPlan, setDeleteModalPlan] = useState(null)

  const loadPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const { plans: list } = await plansService.getPlans()
      setPlans(list || [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load plans")
      handleApiError(err, "Failed to load plans")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleToggleActive = async (plan) => {
    const newActive = !plan.is_active
    setTogglingId(plan.id)
    try {
      await plansService.updatePlan(plan.id, { is_active: newActive })
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, is_active: newActive ? 1 : 0 } : p))
      )
      toast.success(newActive ? "Plan activated" : "Plan deactivated")
    } catch (err) {
      handleApiError(err, newActive ? "Failed to activate plan" : "Failed to deactivate plan")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteSuccess = () => {
    setDeleteModalPlan(null)
    loadPlans()
    toast.success("Plan deleted")
  }

  const handleDeactivateInstead = async (plan) => {
    setDeleteModalPlan(null)
    setTogglingId(plan.id)
    try {
      await plansService.updatePlan(plan.id, { is_active: false })
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, is_active: 0 } : p))
      )
      toast.success("Plan deactivated (cannot delete: linked to investments)")
    } catch (err) {
      handleApiError(err, "Failed to deactivate plan")
    } finally {
      setTogglingId(null)
    }
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "display_order",
        header: "Order",
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-sm">
            {row.original.display_order ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Plan name",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/admin/plans/${row.original.id}`)}
            className="text-primary hover:underline font-medium text-left"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-muted-foreground">
            {row.original.slug}
          </span>
        ),
      },
      {
        id: "min_investment",
        header: "Min investment",
        cell: ({ row }) => {
          const min = row.original.investment_details?.min_investment
          return (
            <span className="text-sm">
              {min != null ? formatCurrency(min) : "—"}
            </span>
          )
        },
      },
      {
        id: "partner_commission",
        header: "Partner %",
        cell: ({ row }) => {
          const pct = row.original.partner_commission?.percent
          return (
            <span className="text-sm">
              {pct != null ? `${pct}%` : "—"}
            </span>
          )
        },
      },
      {
        id: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.is_active ? "active" : "inactive"} />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const plan = row.original
          const isActive = plan.is_active
          const isToggling = togglingId === plan.id
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/admin/plans/${plan.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/admin/plans/${plan.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleToggleActive(plan)}
                  disabled={isToggling}
                >
                  {isToggling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isActive ? (
                    <PowerOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Power className="mr-2 h-4 w-4" />
                  )}
                  {isToggling ? "Updating…" : isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteModalPlan(plan)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [navigate, togglingId]
  )

  const table = useReactTable({
    data: plans,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        description="Investment plans. Create, edit, activate/deactivate, or delete (only when no investments linked)."
        action
        actionLabel={
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add plan
          </>
        }
        onActionClick={() => navigate("/admin/plans/new")}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No plans yet. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <DeletePlanModal
        plan={deleteModalPlan}
        open={!!deleteModalPlan}
        onClose={() => setDeleteModalPlan(null)}
        onDeleted={handleDeleteSuccess}
        onDeactivateInstead={handleDeactivateInstead}
      />
    </div>
  )
}

export default PlansListPage
