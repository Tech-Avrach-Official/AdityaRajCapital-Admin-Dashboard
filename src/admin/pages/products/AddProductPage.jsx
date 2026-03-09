import React, { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { productsService } from "@/lib/api/services"

/** Generate URL-friendly slug from name */
const slugFromName = (name) =>
  (name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

const initialForm = {
  // Basic
  name: "",
  slug: "",
  display_order: "",
  // Returns
  description: "",
  profit_per_month_percent: "",
  capital_per_month_percent: "",
  duration_months: "",
  has_monthly_payout: false,
  has_maturity_amount: false,
  maturity_note: "",
  // Investment details
  min_investment: "",
  monthly_payout_profit: "",
  monthly_payout_capital: "",
  monthly_payout_total: "",
  total_received: "",
  maturity_amount: "",
  // Partner commission
  partner_commission_percent: "",
  partner_commission_description: "",
}

const AddProductPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [autoSlug, setAutoSlug] = useState(true)

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (autoSlug && field === "name") {
      setForm((prev) => ({ ...prev, slug: slugFromName(value) }))
    }
  }, [autoSlug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: (form.slug || slugFromName(form.name)).trim() || undefined,
        display_order: form.display_order === "" ? undefined : Number(form.display_order),
        description: form.description.trim() || undefined,
        profit_per_month_percent: form.profit_per_month_percent === "" ? undefined : Number(form.profit_per_month_percent),
        capital_per_month_percent: form.capital_per_month_percent === "" ? undefined : Number(form.capital_per_month_percent),
        duration_months: form.duration_months === "" ? undefined : Number(form.duration_months),
        has_monthly_payout: Boolean(form.has_monthly_payout),
        has_maturity_amount: Boolean(form.has_maturity_amount),
        maturity_note: form.maturity_note.trim() || undefined,
        min_investment: form.min_investment === "" ? undefined : Number(form.min_investment),
        monthly_payout_profit: form.monthly_payout_profit === "" ? undefined : Number(form.monthly_payout_profit),
        monthly_payout_capital: form.monthly_payout_capital === "" ? undefined : Number(form.monthly_payout_capital),
        monthly_payout_total: form.monthly_payout_total === "" ? undefined : Number(form.monthly_payout_total),
        total_received: form.total_received === "" ? undefined : Number(form.total_received),
        maturity_amount: form.maturity_amount === "" ? undefined : Number(form.maturity_amount),
        partner_commission_percent: form.partner_commission_percent === "" ? undefined : Number(form.partner_commission_percent),
        partner_commission_description: form.partner_commission_description.trim() || undefined,
      }
      const result = await productsService.createProduct(payload)
      if (result?.success !== false) {
        toast.success("Product created successfully")
        navigate("/admin/products")
      } else {
        toast.error(result?.message || "Failed to create product")
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create product")
    } finally {
      setSubmitting(false)
    }
  }

  const regenerateSlug = () => {
    setForm((prev) => ({ ...prev, slug: slugFromName(prev.name) }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Add Product"
          description="Create a new investment product"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic */}
        <Card>
          <CardHeader>
            <CardTitle>Basic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. ACPL Booster Plan"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Switch checked={autoSlug} onCheckedChange={setAutoSlug} />
                    Auto-generate
                  </label>
                  {!autoSlug && (
                    <Button type="button" variant="outline" size="sm" onClick={regenerateSlug}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Generate
                    </Button>
                  )}
                </div>
              </div>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="e.g. acpl-booster-plan"
                disabled={autoSlug}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display_order">Display order</Label>
              <Input
                id="display_order"
                type="number"
                min={0}
                value={form.display_order}
                onChange={(e) => update("display_order", e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Returns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Returns description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="profit_per_month_percent">Profit per month (%)</Label>
                <Input
                  id="profit_per_month_percent"
                  type="number"
                  step="any"
                  value={form.profit_per_month_percent}
                  onChange={(e) => update("profit_per_month_percent", e.target.value)}
                  placeholder="e.g. 1.2"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capital_per_month_percent">Capital per month (%)</Label>
                <Input
                  id="capital_per_month_percent"
                  type="number"
                  step="any"
                  value={form.capital_per_month_percent}
                  onChange={(e) => update("capital_per_month_percent", e.target.value)}
                  placeholder="e.g. 0.5"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration_months">Duration (months)</Label>
              <Input
                id="duration_months"
                type="number"
                min={1}
                value={form.duration_months}
                onChange={(e) => update("duration_months", e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="has_monthly_payout"
                  checked={form.has_monthly_payout}
                  onCheckedChange={(v) => update("has_monthly_payout", v)}
                />
                <Label htmlFor="has_monthly_payout">Has monthly payout</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="has_maturity_amount"
                  checked={form.has_maturity_amount}
                  onCheckedChange={(v) => update("has_maturity_amount", v)}
                />
                <Label htmlFor="has_maturity_amount">Has maturity amount</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maturity_note">Maturity note</Label>
              <Input
                id="maturity_note"
                value={form.maturity_note}
                onChange={(e) => update("maturity_note", e.target.value)}
                placeholder="Optional note about maturity"
              />
            </div>
          </CardContent>
        </Card>

        {/* Investment details */}
        <Card>
          <CardHeader>
            <CardTitle>Investment details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="min_investment">Min investment (INR)</Label>
              <Input
                id="min_investment"
                type="number"
                min={0}
                value={form.min_investment}
                onChange={(e) => update("min_investment", e.target.value)}
                placeholder="e.g. 100000"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="monthly_payout_profit">Monthly payout – profit</Label>
                <Input
                  id="monthly_payout_profit"
                  type="number"
                  step="any"
                  value={form.monthly_payout_profit}
                  onChange={(e) => update("monthly_payout_profit", e.target.value)}
                  placeholder="INR"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthly_payout_capital">Monthly payout – capital</Label>
                <Input
                  id="monthly_payout_capital"
                  type="number"
                  step="any"
                  value={form.monthly_payout_capital}
                  onChange={(e) => update("monthly_payout_capital", e.target.value)}
                  placeholder="INR"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="monthly_payout_total">Monthly payout – total</Label>
              <Input
                id="monthly_payout_total"
                type="number"
                step="any"
                value={form.monthly_payout_total}
                onChange={(e) => update("monthly_payout_total", e.target.value)}
                placeholder="INR"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="total_received">Total received</Label>
                <Input
                  id="total_received"
                  type="number"
                  step="any"
                  value={form.total_received}
                  onChange={(e) => update("total_received", e.target.value)}
                  placeholder="INR"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maturity_amount">Maturity amount (INR)</Label>
                <Input
                  id="maturity_amount"
                  type="number"
                  step="any"
                  value={form.maturity_amount}
                  onChange={(e) => update("maturity_amount", e.target.value)}
                  placeholder="INR"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner commission */}
        <Card>
          <CardHeader>
            <CardTitle>Partner commission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="partner_commission_percent">Commission (%)</Label>
              <Input
                id="partner_commission_percent"
                type="number"
                step="any"
                min={0}
                max={100}
                value={form.partner_commission_percent}
                onChange={(e) => update("partner_commission_percent", e.target.value)}
                placeholder="e.g. 2.5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="partner_commission_description">Description</Label>
              <Input
                id="partner_commission_description"
                value={form.partner_commission_description}
                onChange={(e) => update("partner_commission_description", e.target.value)}
                placeholder="Commission terms or notes"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddProductPage
