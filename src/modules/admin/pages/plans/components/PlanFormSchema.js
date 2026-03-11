/**
 * Zod schema and defaults for Plan Create/Edit forms.
 * Plan type first; description and display strings are built from templates (§5A), not free-text.
 */

import { z } from "zod"
import {
  PLAN_TYPES,
  inferPlanType,
  buildReturnsDescription,
  buildMaturityNoteString,
  buildMinInvestmentDisplay,
  buildMonthlyPayoutDisplay,
  buildDurationDisplay,
  buildTotalReceivedDisplay,
  buildMaturityAmountDisplay,
  buildPartnerCommissionDescription,
  buildRmCommissionDescription,
  calculateInvestmentFromReturns,
} from "./planTemplates"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const optionalNumber = z.union([z.number(), z.string()]).optional()
const optionalNumberInt = z.union([z.number(), z.string()]).optional()

export const planFormSchema = z
  .object({
    plan_type: z.enum(["monthly_only", "maturity_only", "monthly_and_maturity"]).optional(),

    name: z.string().min(1, "Name is required").max(255, "Max 255 characters").trim(),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(120, "Max 120 characters")
      .regex(slugRegex, "Only lowercase letters, numbers, and hyphens (e.g. my-plan)"),
    display_order: z.coerce.number().int().min(0, "Must be ≥ 0").default(0),
    is_active: z.boolean().default(true),

    returns: z.object({
      profit_per_month_percent: optionalNumber,
      capital_per_month_percent: optionalNumber,
      duration_months: optionalNumberInt,
      has_monthly_payout: z.boolean().default(true),
      has_maturity_amount: z.boolean().default(false),
      maturity_return_percent: optionalNumber,
      maturity_note_template: z.string().optional(),
      maturity_note_custom: z.string().optional(),
    }),

    investment_details: z.object({
      min_investment: z
        .union([z.coerce.number(), z.literal("")])
        .refine((v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0, "Min investment must be ≥ 0"),
    }),

    partner_commission: z.object({
      percent: z
        .union([z.coerce.number(), z.literal("")])
        .refine((v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0–100"),
      description: z.string().optional(),
    }),

    has_rm_commission: z.boolean().default(false),
    rm_commission: z
      .object({
        percent: z
          .union([z.coerce.number(), z.literal("")])
          .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100), "Must be 0–100"),
        description: z.string().optional(),
      })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.has_rm_commission && data.rm_commission) {
        const p = data.rm_commission.percent
        return typeof p === "number" && p >= 0 && p <= 100
      }
      return true
    },
    { message: "RM commission % must be 0–100", path: ["rm_commission", "percent"] }
  )
  .refine(
    (data) => {
      if (!data.returns?.has_maturity_amount) return true
      const p = data.returns.maturity_return_percent
      return p != null && p !== "" && !Number.isNaN(Number(p)) && Number(p) > 0
    },
    { message: "Maturity return % is required when plan has maturity", path: ["returns", "maturity_return_percent"] }
  )

export function planToFormValues(plan) {
  if (!plan) return getDefaultFormValues()
  const returns_ = plan.returns ?? {}
  const inv = plan.investment_details ?? {}
  const pc = plan.partner_commission ?? {}
  const rm = plan.rm_commission
  const planType = inferPlanType(plan)
  return {
    plan_type: planType,
    name: plan.name ?? "",
    slug: plan.slug ?? "",
    display_order: plan.display_order ?? 0,
    is_active: !!plan.is_active,

    returns: {
      profit_per_month_percent: returns_.profit_per_month_percent ?? "",
      capital_per_month_percent: returns_.capital_per_month_percent ?? "",
      duration_months: returns_.duration_months ?? inv.duration_months ?? "",
      has_monthly_payout: returns_.has_monthly_payout ?? true,
      has_maturity_amount: returns_.has_maturity_amount ?? false,
      maturity_return_percent:
        returns_.maturity_return_percent != null && returns_.maturity_return_percent !== ""
          ? returns_.maturity_return_percent
          : inv.min_investment && inv.maturity_amount
            ? Math.round((Number(inv.maturity_amount) / Number(inv.min_investment)) * 100)
            : "",
      maturity_note_template: "capital_at_maturity",
      maturity_note_custom: returns_.maturity_note ?? "",
    },

    investment_details: {
      min_investment: inv.min_investment ?? "",
    },

    partner_commission: {
      percent: pc.percent ?? "",
      description: pc.description ?? "",
    },

    has_rm_commission: rm != null && typeof rm === "object",
    rm_commission: rm != null && typeof rm === "object" ? { percent: rm.percent ?? "", description: rm.description ?? "" } : null,
  }
}

export function getDefaultFormValues() {
  return {
    plan_type: undefined,
    name: "",
    slug: "",
    display_order: 0,
    is_active: true,
    returns: {
      profit_per_month_percent: "",
      capital_per_month_percent: "",
      duration_months: "",
      has_monthly_payout: true,
      has_maturity_amount: false,
      maturity_note_template: "capital_at_maturity",
      maturity_note_custom: "",
    },
    investment_details: {
      min_investment: "",
    },
    partner_commission: { percent: "", description: "" },
    has_rm_commission: false,
    rm_commission: null,
  }
}

const num = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? undefined : Number(v))
const str = (v) => (v === "" || v == null ? undefined : String(v).trim())

function getPlanTypeFromValues(values) {
  if (values.plan_type) return values.plan_type
  const hasMonthly = values.returns?.has_monthly_payout
  const hasMaturity = values.returns?.has_maturity_amount
  if (hasMonthly && hasMaturity) return "monthly_and_maturity"
  if (hasMaturity) return "maturity_only"
  return "monthly_only"
}

/** Build full create body; duration from Returns only; monthly/total_received/total_profit calculated (§5C) */
export function formValuesToCreateBody(values) {
  const planType = getPlanTypeFromValues(values)
  const ret = values.returns ?? {}
  const inv = values.investment_details ?? {}

  const durationMonths = num(ret.duration_months)
  const minInv = num(inv.min_investment) ?? 0
  const maturityReturnPct = ret.maturity_return_percent

  const calculated = calculateInvestmentFromReturns(
    planType,
    minInv,
    durationMonths,
    ret.profit_per_month_percent,
    ret.capital_per_month_percent,
    maturityReturnPct
  )

  const description = buildReturnsDescription(planType, values)
  const maturityNote = (planType === "monthly_only")
    ? "No maturity amount - capital is already returned in monthly payouts."
    : buildMaturityNoteString(values)

  const returns = {
    description: description || undefined,
    profit_per_month_percent: planType === "maturity_only" ? 0 : num(ret.profit_per_month_percent),
    capital_per_month_percent: planType === "maturity_only" ? 0 : (num(ret.capital_per_month_percent) ?? 0),
    duration_months: durationMonths,
    has_monthly_payout: planType !== "maturity_only",
    has_maturity_amount: planType !== "monthly_only",
    ...(planType !== "monthly_only" && num(maturityReturnPct) != null && { maturity_return_percent: num(maturityReturnPct) }),
    maturity_note: maturityNote || undefined,
  }

  const valuesWithCalculated = {
    ...values,
    investment_details: {
      ...inv,
      duration_months: durationMonths,
      monthly_payout_profit: calculated.monthly_payout_profit,
      monthly_payout_capital: calculated.monthly_payout_capital,
      monthly_payout_total: calculated.monthly_payout_total,
      total_received: calculated.total_received,
      total_profit: calculated.total_profit,
      maturity_amount: calculated.maturity_amount,
    },
  }
  const monthlyPayoutDisplay = buildMonthlyPayoutDisplay(valuesWithCalculated, planType)

  const investment_details = {
    min_investment: minInv,
    min_investment_display: buildMinInvestmentDisplay(minInv) || undefined,
    monthly_payout_profit: calculated.monthly_payout_profit ?? (planType === "maturity_only" ? 0 : undefined),
    monthly_payout_capital: calculated.monthly_payout_capital ?? (planType === "maturity_only" ? 0 : undefined),
    monthly_payout_total: calculated.monthly_payout_total ?? (planType === "maturity_only" ? 0 : undefined),
    monthly_payout_display: monthlyPayoutDisplay || undefined,
    duration_months: durationMonths,
    duration_display: buildDurationDisplay(durationMonths) || undefined,
    total_received: calculated.total_received ?? undefined,
    total_received_display: buildTotalReceivedDisplay(calculated.total_received) || undefined,
    total_profit: planType === "monthly_and_maturity" ? (calculated.total_profit ?? undefined) : undefined,
    maturity_amount: planType === "monthly_only" ? null : (calculated.maturity_amount ?? null),
    maturity_amount_display: planType === "monthly_only" ? null : (buildMaturityAmountDisplay(calculated.maturity_amount, planType) || null),
  }

  const partnerPercent = num(values.partner_commission?.percent) ?? 0
  const partnerDesc = str(values.partner_commission?.description) || buildPartnerCommissionDescription(values.partner_commission?.percent)

  const body = {
    name: str(values.name),
    slug: str(values.slug).toLowerCase(),
    display_order: num(values.display_order) ?? 0,
    is_active: values.is_active ?? true,
    returns,
    investment_details,
    partner_commission: {
      percent: partnerPercent,
      ...(partnerDesc && { description: partnerDesc }),
    },
    rm_commission:
      values.has_rm_commission && values.rm_commission
        ? {
            percent: num(values.rm_commission.percent) ?? 0,
            description: str(values.rm_commission.description) || buildRmCommissionDescription(values.rm_commission.percent),
          }
        : null,
  }
  return body
}

/** Build API update (partial) body; use templates when sending returns/investment_details */
export function formValuesToUpdateBody(values, initialValues) {
  const body = {}
  if (values.name !== initialValues?.name) body.name = String(values.name).trim()
  if (values.slug !== initialValues?.slug) body.slug = String(values.slug).toLowerCase()
  if (Number(values.display_order) !== Number(initialValues?.display_order)) body.display_order = Number(values.display_order) || 0
  if (values.is_active !== initialValues?.is_active) body.is_active = values.is_active

  const planType = getPlanTypeFromValues(values)
  const ret = values.returns
  const retInit = initialValues?.returns
  const returnsChanged = ret && JSON.stringify({ ...ret, has_monthly_payout: ret.has_monthly_payout, has_maturity_amount: ret.has_maturity_amount }) !== JSON.stringify({ ...retInit, has_monthly_payout: retInit?.has_monthly_payout, has_maturity_amount: retInit?.has_maturity_amount })
  if (returnsChanged) {
    const description = buildReturnsDescription(planType, values)
    const maturityNote = planType === "monthly_only" ? undefined : buildMaturityNoteString(values)
    body.returns = {
      ...(description && { description }),
      ...(num(ret.profit_per_month_percent) != null && { profit_per_month_percent: num(ret.profit_per_month_percent) }),
      ...(num(ret.capital_per_month_percent) != null && { capital_per_month_percent: num(ret.capital_per_month_percent) }),
      ...(num(ret.duration_months) != null && { duration_months: num(ret.duration_months) }),
      has_monthly_payout: ret.has_monthly_payout,
      has_maturity_amount: ret.has_maturity_amount,
      ...(planType !== "monthly_only" && num(ret.maturity_return_percent) != null && { maturity_return_percent: num(ret.maturity_return_percent) }),
      ...(maturityNote && { maturity_note: maturityNote }),
    }
  }

  const inv = values.investment_details
  const invInit = initialValues?.investment_details
  const invChanged = inv && Number(inv.min_investment) !== Number(invInit?.min_investment)
  if (invChanged || returnsChanged) {
    const durationMonths = num(ret?.duration_months) ?? num(initialValues?.returns?.duration_months)
    const minInv = num(inv.min_investment) ?? 0
    const maturityReturnPct = ret?.maturity_return_percent ?? initialValues?.returns?.maturity_return_percent
    const calculated = calculateInvestmentFromReturns(
      planType,
      minInv,
      durationMonths,
      ret?.profit_per_month_percent,
      ret?.capital_per_month_percent,
      maturityReturnPct
    )
    const valuesWithCalculated = {
      ...values,
      investment_details: {
        ...inv,
        duration_months: durationMonths,
        monthly_payout_profit: calculated.monthly_payout_profit,
        monthly_payout_capital: calculated.monthly_payout_capital,
        monthly_payout_total: calculated.monthly_payout_total,
        total_received: calculated.total_received,
        total_profit: calculated.total_profit,
        maturity_amount: calculated.maturity_amount,
      },
    }
    body.investment_details = {
      min_investment: minInv,
      min_investment_display: buildMinInvestmentDisplay(minInv) || undefined,
      monthly_payout_profit: calculated.monthly_payout_profit ?? (planType === "maturity_only" ? 0 : undefined),
      monthly_payout_capital: calculated.monthly_payout_capital ?? (planType === "maturity_only" ? 0 : undefined),
      monthly_payout_total: calculated.monthly_payout_total ?? (planType === "maturity_only" ? 0 : undefined),
      monthly_payout_display: buildMonthlyPayoutDisplay(valuesWithCalculated, planType) || undefined,
      duration_months: durationMonths,
      duration_display: buildDurationDisplay(durationMonths) || undefined,
      total_received: calculated.total_received ?? undefined,
      total_received_display: buildTotalReceivedDisplay(calculated.total_received) || undefined,
      ...(planType === "monthly_and_maturity" && calculated.total_profit != null && { total_profit: calculated.total_profit }),
      maturity_amount: planType === "monthly_only" ? null : (calculated.maturity_amount ?? null),
      maturity_amount_display: planType === "monthly_only" ? null : (buildMaturityAmountDisplay(calculated.maturity_amount, planType) || null),
    }
  }

  const pc = values.partner_commission
  const pcInit = initialValues?.partner_commission
  if (pc && (Number(pc.percent) !== Number(pcInit?.percent) || String(pc.description || "") !== String(pcInit?.description || ""))) {
    const desc = str(pc.description) || buildPartnerCommissionDescription(pc.percent)
    body.partner_commission = { percent: num(pc.percent) ?? 0, ...(desc && { description: desc }) }
  }

  const hadRm = initialValues?.has_rm_commission && initialValues?.rm_commission
  const hasRm = values.has_rm_commission && values.rm_commission
  if (hasRm !== hadRm || (hasRm && (Number(values.rm_commission?.percent) !== Number(initialValues?.rm_commission?.percent) || String(values.rm_commission?.description || "") !== String(initialValues?.rm_commission?.description || "")))) {
    if (values.has_rm_commission && values.rm_commission) {
      const rmDesc = str(values.rm_commission.description) || buildRmCommissionDescription(values.rm_commission.percent)
      body.rm_commission = { percent: num(values.rm_commission.percent) ?? 0, ...(rmDesc && { description: rmDesc }) }
    } else {
      body.rm_commission = null
    }
  }

  return body
}
