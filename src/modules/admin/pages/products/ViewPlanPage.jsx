import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { productsService } from "@/modules/admin/api/services/productsService"

const ViewPlanPage = () => {
  const { id } = useParams()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadPlan()
  }, [id])

  const loadPlan = async () => {
    setLoading(true)
    try {
      const data = await productsService.getPlan(id)
      setPlan(data)
    } catch (error) {
      toast.error("Failed to load plan")
    } finally {
      setLoading(false)
    }
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
        <Button variant="ghost" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <p className="text-muted-foreground">Plan not found.</p>
      </div>
    )
  }

  const returns_ = plan.returns ?? {}
  const inv = plan.investment_details ?? {}
  const commission = plan.partner_commission ?? {}

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <PageHeader
          title={plan.name}
          description={plan.slug ? `Slug: ${plan.slug}` : "Plan details"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{plan.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Slug</p>
            <p className="font-medium">{plan.slug ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Display order</p>
            <p className="font-medium">{plan.display_order ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {returns_.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{returns_.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
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
              <p className="text-sm text-muted-foreground">Monthly payout</p>
              <p className="font-medium">{returns_.has_monthly_payout ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maturity amount</p>
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
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Min investment</p>
            <p className="font-medium">{inv.min_investment_display ?? inv.min_investment ?? "—"}</p>
          </div>
          {inv.monthly_payout_display && (
            <div>
              <p className="text-sm text-muted-foreground">Monthly payout</p>
              <p className="font-medium">{inv.monthly_payout_display}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{inv.duration_display ?? inv.duration_months ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total received</p>
            <p className="font-medium">{inv.total_received_display ?? inv.total_received ?? "—"}</p>
          </div>
          {(inv.maturity_amount != null || inv.maturity_amount_display) && (
            <div>
              <p className="text-sm text-muted-foreground">Maturity amount</p>
              <p className="font-medium">{inv.maturity_amount_display ?? inv.maturity_amount ?? "—"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partner commission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {commission.percent != null && (
            <div>
              <p className="text-sm text-muted-foreground">Percent</p>
              <p className="font-medium">{commission.percent}%</p>
            </div>
          )}
          {commission.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{commission.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(plan.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Updated</p>
            <p className="font-medium">{formatDate(plan.updated_at)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ViewPlanPage
