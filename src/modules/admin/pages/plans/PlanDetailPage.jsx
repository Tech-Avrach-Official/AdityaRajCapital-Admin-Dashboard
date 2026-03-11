import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, Power, PowerOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import PageHeader from "@/components/common/PageHeader"
import StatusBadge from "@/components/common/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { plansService } from "@/modules/admin/api/services/plansService"
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

const formatDate = (dateStr) => {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return dateStr
  }
}

const PlanDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const loadPlan = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await plansService.getPlan(id)
      setPlan(data)
    } catch (err) {
      handleApiError(err, "Failed to load plan")
      setPlan(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlan()
  }, [id])

  const handleToggleActive = async () => {
    if (!plan) return
    setToggling(true)
    try {
      const updated = await plansService.updatePlan(plan.id, {
        is_active: !plan.is_active,
      })
      setPlan(updated)
      toast.success(updated.is_active ? "Plan activated" : "Plan deactivated")
    } catch (err) {
      handleApiError(err, "Failed to update plan")
    } finally {
      setToggling(false)
    }
  }

  const handleDeleteSuccess = () => {
    setDeleteModalOpen(false)
    toast.success("Plan deleted")
    navigate("/admin/plans")
  }

  const handleDeactivateInstead = async (p) => {
    setDeleteModalOpen(false)
    setToggling(true)
    try {
      const updated = await plansService.updatePlan(p.id, { is_active: false })
      setPlan(updated)
      toast.success("Plan deactivated (cannot delete: linked to investments)")
    } catch (err) {
      handleApiError(err, "Failed to deactivate plan")
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/admin/plans")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        <p className="text-muted-foreground">Plan not found.</p>
      </div>
    )
  }

  const returns_ = plan.returns ?? {}
  const inv = plan.investment_details ?? {}
  const partnerComm = plan.partner_commission ?? {}
  const rmComm = plan.rm_commission ?? {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/plans")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/plans/${plan.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
            disabled={toggling}
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : plan.is_active ? (
              <PowerOff className="h-4 w-4 mr-2" />
            ) : (
              <Power className="h-4 w-4 mr-2" />
            )}
            {toggling ? "Updating…" : plan.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PageHeader
          title={plan.name}
          description={plan.slug ? `Slug: ${plan.slug}` : "Plan details"}
        />
        <StatusBadge status={plan.is_active ? "active" : "inactive"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{plan.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Slug</p>
            <p className="font-mono text-sm">{plan.slug ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Display order</p>
            <p className="font-medium">{plan.display_order ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created / Updated</p>
            <p className="text-sm">
              {formatDate(plan.created_at)} / {formatDate(plan.updated_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {returns_.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{returns_.description}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {returns_.profit_per_month_percent != null && (
              <div>
                <p className="text-sm text-muted-foreground">Profit per month (%)</p>
                <p className="font-medium">{returns_.profit_per_month_percent}%</p>
              </div>
            )}
            {returns_.capital_per_month_percent != null && (
              <div>
                <p className="text-sm text-muted-foreground">Capital per month (%)</p>
                <p className="font-medium">{returns_.capital_per_month_percent}%</p>
              </div>
            )}
            {returns_.duration_months != null && (
              <div>
                <p className="text-sm text-muted-foreground">Duration (months)</p>
                <p className="font-medium">{returns_.duration_months}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Has monthly payout</p>
              <p className="font-medium">{returns_.has_monthly_payout ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Has maturity amount</p>
              <p className="font-medium">{returns_.has_maturity_amount ? "Yes" : "No"}</p>
            </div>
          </div>
          {returns_.maturity_note && (
            <div>
              <p className="text-sm text-muted-foreground">Maturity note</p>
              <p className="font-medium">{returns_.maturity_note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Min investment</p>
              <p className="font-medium">{formatCurrency(inv.min_investment)}</p>
              {inv.min_investment_display && (
                <p className="text-sm text-muted-foreground">{inv.min_investment_display}</p>
              )}
            </div>
            {inv.duration_months != null && (
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{inv.duration_display ?? `${inv.duration_months} months`}</p>
              </div>
            )}
          </div>
          {inv.monthly_payout_display && (
            <div>
              <p className="text-sm text-muted-foreground">Monthly payout</p>
              <p className="font-medium">{inv.monthly_payout_display}</p>
            </div>
          )}
          {inv.total_received_display && (
            <div>
              <p className="text-sm text-muted-foreground">Total received</p>
              <p className="font-medium">{inv.total_received_display}</p>
            </div>
          )}
          {(inv.maturity_amount != null || inv.maturity_amount_display) && (
            <div>
              <p className="text-sm text-muted-foreground">Maturity amount</p>
              <p className="font-medium">
                {inv.maturity_amount_display ?? formatCurrency(inv.maturity_amount)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partner commission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{partnerComm.percent ?? "—"}%</p>
          {partnerComm.description && (
            <p className="text-sm text-muted-foreground">{partnerComm.description}</p>
          )}
        </CardContent>
      </Card>

      {(rmComm != null && (rmComm.percent != null || rmComm.description)) && (
        <Card>
          <CardHeader>
            <CardTitle>RM commission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{rmComm.percent ?? "—"}%</p>
            {rmComm.description && (
              <p className="text-sm text-muted-foreground">{rmComm.description}</p>
            )}
          </CardContent>
        </Card>
      )}

      <DeletePlanModal
        plan={plan}
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDeleted={handleDeleteSuccess}
        onDeactivateInstead={handleDeactivateInstead}
      />
    </div>
  )
}

export default PlanDetailPage
