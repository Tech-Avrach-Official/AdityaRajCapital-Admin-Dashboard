import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  planFormSchema,
  planToFormValues,
  getDefaultFormValues,
  formValuesToCreateBody,
  formValuesToUpdateBody,
} from "./PlanFormSchema"
import {
  PLAN_TYPES,
  MATURITY_NOTE_TEMPLATES,
  buildReturnsDescription,
  buildMaturityNoteString,
  buildPartnerCommissionDescription,
  buildRmCommissionDescription,
  calculateInvestmentFromReturns,
  formatCurrency,
} from "./planTemplates"

/** Generate URL-safe slug from plan name: lowercase, hyphens, no special chars */
function nameToSlug(name) {
  if (!name || typeof name !== "string") return ""
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120)
}

const PLAN_TYPE_OPTIONS = [
  { value: PLAN_TYPES.MONTHLY_ONLY, label: "Monthly only", desc: "Profit/capital paid every month; no lump sum at end" },
  { value: PLAN_TYPES.MATURITY_ONLY, label: "Maturity only", desc: "No monthly payouts; lump sum at end (e.g. double capital)" },
  { value: PLAN_TYPES.MONTHLY_AND_MATURITY, label: "Monthly + maturity", desc: "Monthly profit + capital at maturity" },
]

const PlanForm = ({ mode = "create", initialPlan = null, onSubmit, onCancel, submitLabel = "Save", loading = false }) => {
  const defaultValues = initialPlan ? planToFormValues(initialPlan) : getDefaultFormValues()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(planFormSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(initialPlan ? planToFormValues(initialPlan) : getDefaultFormValues())
  }, [initialPlan, reset])

  const planType = watch("plan_type")
  const hasMonthlyPayout = watch("returns.has_monthly_payout")
  const hasMaturityAmount = watch("returns.has_maturity_amount")
  const hasRmCommission = watch("has_rm_commission")
  const maturityNoteTemplate = watch("returns.maturity_note_template")
  const partnerPercent = watch("partner_commission.percent")
  const rmPercent = watch("rm_commission.percent")

  useEffect(() => {
    const p = partnerPercent
    const built = p != null && p !== "" && !Number.isNaN(Number(p)) ? buildPartnerCommissionDescription(p) : ""
    setValue("partner_commission.description", built)
  }, [partnerPercent, setValue])
  useEffect(() => {
    if (!hasRmCommission) return
    const p = rmPercent
    const built = p != null && p !== "" && !Number.isNaN(Number(p)) ? buildRmCommissionDescription(p) : ""
    setValue("rm_commission.description", built)
  }, [hasRmCommission, rmPercent, setValue])

  const setPlanType = (type) => {
    setValue("plan_type", type)
    if (type === PLAN_TYPES.MONTHLY_ONLY) {
      setValue("returns.has_monthly_payout", true)
      setValue("returns.has_maturity_amount", false)
    } else if (type === PLAN_TYPES.MATURITY_ONLY) {
      setValue("returns.has_monthly_payout", false)
      setValue("returns.has_maturity_amount", true)
    } else {
      setValue("returns.has_monthly_payout", true)
      setValue("returns.has_maturity_amount", true)
    }
  }

  const handleFormSubmit = (values) => {
    if (mode === "create") {
      const body = formValuesToCreateBody(values)
      onSubmit(body)
    } else {
      const initialValues = planToFormValues(initialPlan)
      const body = formValuesToUpdateBody(values, initialValues)
      if (Object.keys(body).length === 0) return
      onSubmit(body)
    }
  }

  const showPlanTypeStep = mode === "create" || !initialPlan
  const effectivePlanType = planType || (hasMaturityAmount && hasMonthlyPayout ? PLAN_TYPES.MONTHLY_AND_MATURITY : hasMaturityAmount ? PLAN_TYPES.MATURITY_ONLY : PLAN_TYPES.MONTHLY_ONLY)
  const showMonthlyReturns = effectivePlanType === PLAN_TYPES.MONTHLY_ONLY || effectivePlanType === PLAN_TYPES.MONTHLY_AND_MATURITY
  const showMaturityReturns = effectivePlanType === PLAN_TYPES.MATURITY_ONLY || effectivePlanType === PLAN_TYPES.MONTHLY_AND_MATURITY
  const showMonthlyInvestment = effectivePlanType === PLAN_TYPES.MONTHLY_ONLY || effectivePlanType === PLAN_TYPES.MONTHLY_AND_MATURITY
  const showMaturityInvestment = effectivePlanType === PLAN_TYPES.MATURITY_ONLY || effectivePlanType === PLAN_TYPES.MONTHLY_AND_MATURITY

  const formValues = watch()
  const previewDescription = buildReturnsDescription(effectivePlanType, formValues)
  const previewMaturityNote = showMaturityReturns ? buildMaturityNoteString(formValues) : null

  const calculated = calculateInvestmentFromReturns(
    effectivePlanType,
    formValues?.investment_details?.min_investment,
    formValues?.returns?.duration_months,
    formValues?.returns?.profit_per_month_percent,
    formValues?.returns?.capital_per_month_percent,
    formValues?.returns?.maturity_return_percent
  )

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Step 1 – Plan type (required first for create) */}
      <Card>
        <CardHeader>
          <CardTitle>Plan type</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the type of plan. This determines which fields are shown below. Description and display strings are generated from your inputs.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLAN_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => showPlanTypeStep && setPlanType(opt.value)}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  effectivePlanType === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/30"
                } ${!showPlanTypeStep ? "cursor-default opacity-90" : ""}`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common fields (all types) */}
      <Card>
        <CardHeader>
          <CardTitle>Basic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. ACPL 5% Monthly"
                {...register("name", {
                  onChange: (e) => {
                    register("name").onChange(e)
                    setValue("slug", nameToSlug(e.target.value), { shouldValidate: true })
                  },
                })}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" {...register("slug")} placeholder="Auto-generated from name" className="lowercase" />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_order">Display order</Label>
              <Input id="display_order" type="number" min={0} {...register("display_order")} />
              {errors.display_order && <p className="text-sm text-destructive">{errors.display_order.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_active" checked={watch("is_active")} onCheckedChange={(v) => setValue("is_active", v)} />
              <Label htmlFor="is_active">Active (visible to investors)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns – type-specific; description & maturity note shown inline (auto-generated) */}
      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
          <p className="text-sm text-muted-foreground">
            Duration and percentages. Description and maturity note below are generated from these values.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
              {previewDescription ? (
                <span className="text-foreground">{previewDescription}</span>
              ) : (
                <span className="text-muted-foreground italic">Fill duration and percentages below to see description.</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration (months) *</Label>
            <Input type="number" min={1} {...register("returns.duration_months")} />
          </div>

          {showMonthlyReturns && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profit per month (%)</Label>
                <Input type="number" step={0.01} {...register("returns.profit_per_month_percent")} />
              </div>
              <div className="space-y-2">
                <Label>Capital per month (%)</Label>
                <Input type="number" step={0.01} {...register("returns.capital_per_month_percent")} />
              </div>
            </div>
          )}

          {showMaturityReturns && (
            <>
              <div className="space-y-2">
                <Label>Maturity return (%) *</Label>
                <Input
                  type="number"
                  step={0.01}
                  min={0}
                  {...register("returns.maturity_return_percent")}
                  placeholder="e.g. 100 = capital back, 200 = double"
                />
                {errors.returns?.maturity_return_percent && (
                  <p className="text-sm text-destructive">{errors.returns.maturity_return_percent.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Maturity note (template)</Label>
                <Select
                  value={maturityNoteTemplate || "capital_at_maturity"}
                  onValueChange={(v) => setValue("returns.maturity_note_template", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATURITY_NOTE_TEMPLATES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {maturityNoteTemplate === "custom" && (
                  <Input
                    {...register("returns.maturity_note_custom")}
                    placeholder="e.g. 100% capital at maturity (after {{duration_months}} months)"
                    className="mt-2"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Maturity note</Label>
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
                  {previewMaturityNote ? (
                    <span className="text-foreground">{previewMaturityNote}</span>
                  ) : (
                    <span className="text-muted-foreground italic">Choose template and fill duration.</span>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Investment details – Min investment as input; maturity amount calculated from Returns; rest calculated (§5C) */}
      <Card>
        <CardHeader>
          <CardTitle>Investment details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter min investment. For maturity types, set Maturity return % in Returns; maturity amount is calculated. Duration is from Returns. Monthly payout and total received are calculated from Returns + min investment.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inv.min_investment">Min investment (₹) *</Label>
            <Input id="inv.min_investment" type="number" min={0} {...register("investment_details.min_investment")} />
            {errors.investment_details?.min_investment && (
              <p className="text-sm text-destructive">{errors.investment_details.min_investment.message}</p>
            )}
          </div>

          {showMaturityInvestment && (
            <div className="space-y-2">
              <Label>Maturity amount (₹)</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
                {calculated.maturity_amount != null ? formatCurrency(calculated.maturity_amount) : "—"}
              </div>
            </div>
          )}

          {showMonthlyInvestment && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Monthly payout profit</Label>
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
                  {calculated.monthly_payout_profit != null ? formatCurrency(calculated.monthly_payout_profit) : "—"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monthly payout capital</Label>
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
                  {calculated.monthly_payout_capital != null ? formatCurrency(calculated.monthly_payout_capital) : "—"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monthly payout total</Label>
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
                  {calculated.monthly_payout_total != null ? formatCurrency(calculated.monthly_payout_total) : "—"}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Total received</Label>
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
              {calculated.total_received != null ? formatCurrency(calculated.total_received) : "—"}
            </div>
          </div>

          {effectivePlanType === PLAN_TYPES.MONTHLY_AND_MATURITY && (
            <div className="space-y-2">
              <Label>Total profit</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
                {calculated.total_profit != null ? formatCurrency(calculated.total_profit) : "—"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner commission */}
      <Card>
        <CardHeader>
          <CardTitle>Partner commission</CardTitle>
          <p className="text-sm text-muted-foreground">
            Description is filled from commission %; you can edit it if needed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pc.percent">Commission % *</Label>
              <Input id="pc.percent" type="number" min={0} max={100} step={0.01} {...register("partner_commission.percent")} />
              {errors.partner_commission?.percent && (
                <p className="text-sm text-destructive">{errors.partner_commission.percent.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc.description">Description (optional)</Label>
              <Input id="pc.description" {...register("partner_commission.description")} placeholder="Filled from % above" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RM commission */}
      <Card>
        <CardHeader>
          <CardTitle>RM commission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_rm_commission"
              checked={hasRmCommission}
              onCheckedChange={(v) => {
                setValue("has_rm_commission", !!v)
                if (!v) setValue("rm_commission", null)
                else setValue("rm_commission", { percent: "", description: "" })
              }}
            />
            <Label htmlFor="has_rm_commission">Has RM commission</Label>
          </div>
          {hasRmCommission && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label>RM commission %</Label>
                <Input type="number" min={0} max={100} step={0.01} {...register("rm_commission.percent")} />
                {errors.rm_commission?.percent && (
                  <p className="text-sm text-destructive">{errors.rm_commission.percent.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input {...register("rm_commission.description")} placeholder="Filled from % above" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default PlanForm
