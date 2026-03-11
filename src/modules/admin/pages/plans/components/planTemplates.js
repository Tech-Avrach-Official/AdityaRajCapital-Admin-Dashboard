/**
 * Plan module: build description and display strings from templates (§5A).
 * No free-text inputs for these; substitute placeholders from form values.
 */

export const PLAN_TYPES = {
  MONTHLY_ONLY: "monthly_only",
  MATURITY_ONLY: "maturity_only",
  MONTHLY_AND_MATURITY: "monthly_and_maturity",
}

/** Format number as INR (Indian format) */
export function formatCurrency(amount) {
  if (amount == null || amount === "" || Number.isNaN(Number(amount))) return null
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

/** Build returns.description from plan type and form values (§5A.1) */
export function buildReturnsDescription(planType, values) {
  const ret = values?.returns ?? {}
  const inv = values?.investment_details ?? {}
  const duration = ret.duration_months ?? inv.duration_months
  const durationMonths = duration === "" || duration == null ? "" : Number(duration)
  const profitPct = ret.profit_per_month_percent === "" || ret.profit_per_month_percent == null ? "" : Number(ret.profit_per_month_percent)
  const capitalPct = ret.capital_per_month_percent === "" || ret.capital_per_month_percent == null ? 0 : Number(ret.capital_per_month_percent)
  const maturityNote = buildMaturityNoteString(values)

  if (planType === PLAN_TYPES.MONTHLY_ONLY) {
    if (capitalPct && capitalPct > 0) {
      return `${profitPct}% profit + ${capitalPct}% capital every month for ${durationMonths} months. No maturity amount (capital is already returned in monthly payouts).`
    }
    return `${profitPct}% profit every month for ${durationMonths} months. No maturity amount.`
  }
  if (planType === PLAN_TYPES.MATURITY_ONLY) {
    const maturityReturnPct = ret.maturity_return_percent === "" || ret.maturity_return_percent == null ? "" : Number(ret.maturity_return_percent)
    if (maturityReturnPct !== "") {
      return `${maturityReturnPct}% return on investment at maturity after ${durationMonths} months. Maturity only (no monthly payouts).`
    }
    return `${maturityNote} Duration ${durationMonths} months. No monthly payouts.`
  }
  if (planType === PLAN_TYPES.MONTHLY_AND_MATURITY) {
    return `${profitPct}% profit every month for ${durationMonths} months. ${maturityNote}`
  }
  return ""
}

/** Build maturity_note string from form; use maturity_return_percent (§5A.2) */
export function buildMaturityNoteString(values) {
  const templateKey = values?.returns?.maturity_note_template
  const ret = values?.returns ?? {}
  const inv = values?.investment_details ?? {}
  const duration = ret.duration_months ?? inv.duration_months
  const durationMonths = duration === "" || duration == null ? "" : Number(duration)
  const maturityReturnPct = ret.maturity_return_percent === "" || ret.maturity_return_percent == null ? 100 : Number(ret.maturity_return_percent)

  if (templateKey === "capital_at_maturity") {
    return `${maturityReturnPct}% return at maturity (after ${durationMonths} months).`
  }
  if (templateKey === "capital_doubles") {
    return maturityReturnPct === 200 ? "Capital doubles at maturity." : `${maturityReturnPct}% return at maturity.`
  }
  if (templateKey === "custom" && values?.returns?.maturity_note_custom) {
    return String(values.returns.maturity_note_custom)
      .replace(/\{\{duration_months\}\}/g, durationMonths)
      .replace(/\{\{maturity_return_percent\}\}/g, maturityReturnPct)
  }
  return `${maturityReturnPct}% return at maturity (after ${durationMonths} months).`
}

/** Min investment display: format as currency (§5A.3) */
export function buildMinInvestmentDisplay(minInvestment) {
  return formatCurrency(minInvestment)
}

/** Monthly payout display: "₹X per month (Y% profit)" or "No monthly payouts" (§5A.3) */
export function buildMonthlyPayoutDisplay(values, planType) {
  if (planType === PLAN_TYPES.MATURITY_ONLY) {
    return "No monthly payouts"
  }
  const inv = values?.investment_details ?? {}
  const ret = values?.returns ?? {}
  const total = inv.monthly_payout_total === "" || inv.monthly_payout_total == null ? null : Number(inv.monthly_payout_total)
  const profitPct = ret.profit_per_month_percent === "" || ret.profit_per_month_percent == null ? null : Number(ret.profit_per_month_percent)
  if (total == null || total === 0) {
    return "No monthly payouts"
  }
  const formatted = formatCurrency(total)
  if (profitPct != null && profitPct > 0) {
    return `${formatted} per month (${profitPct}% profit)`
  }
  return `${formatted} per month`
}

/** Duration display: "X months" (§5A.3) */
export function buildDurationDisplay(durationMonths) {
  if (durationMonths === "" || durationMonths == null || Number.isNaN(Number(durationMonths))) return null
  return `${Number(durationMonths)} months`
}

/** Total received display: format as currency (§5A.3) */
export function buildTotalReceivedDisplay(totalReceived) {
  return formatCurrency(totalReceived)
}

/** Maturity amount display: "₹X (capital)" or null (§5A.3) */
export function buildMaturityAmountDisplay(maturityAmount, planType) {
  if (planType === PLAN_TYPES.MONTHLY_ONLY) return null
  if (maturityAmount === "" || maturityAmount == null || Number.isNaN(Number(maturityAmount))) return null
  return `${formatCurrency(maturityAmount)} (capital)`
}

/** Partner commission description template (§5A.4) */
export function buildPartnerCommissionDescription(percent) {
  if (percent === "" || percent == null) return ""
  return `Partner gets ${Number(percent)}% of investment amount when a referred investor buys this plan.`
}

/** RM commission description template (§5A.4) */
export function buildRmCommissionDescription(percent) {
  if (percent === "" || percent == null) return ""
  return `RM commission ${Number(percent)}%`
}

/**
 * §5C – Calculated fields from Returns + Min investment.
 * maturity_amount = min_investment × (maturity_return_percent / 100); not user input.
 * Returns { monthly_payout_profit, monthly_payout_capital, monthly_payout_total, maturity_amount, total_received, total_profit }.
 */
export function calculateInvestmentFromReturns(planType, minInvestment, durationMonths, profitPct, capitalPct, maturityReturnPercent) {
  const minInv = Number(minInvestment)
  const dur = Number(durationMonths)
  const profit = Number(profitPct) || 0
  const capital = Number(capitalPct) || 0
  const maturityPct = maturityReturnPercent === "" || maturityReturnPercent == null ? null : Number(maturityReturnPercent)
  const maturity_amount =
    maturityPct != null && !Number.isNaN(maturityPct) && (planType === PLAN_TYPES.MATURITY_ONLY || planType === PLAN_TYPES.MONTHLY_AND_MATURITY)
      ? minInv * (maturityPct / 100)
      : null

  if (Number.isNaN(minInv) || minInv < 0) {
    return {
      monthly_payout_profit: null,
      monthly_payout_capital: null,
      monthly_payout_total: null,
      maturity_amount: null,
      total_received: null,
      total_profit: null,
    }
  }

  let monthly_payout_profit = 0
  let monthly_payout_capital = 0
  let monthly_payout_total = 0
  let total_received = null
  let total_profit = null

  if (planType === PLAN_TYPES.MONTHLY_ONLY || planType === PLAN_TYPES.MONTHLY_AND_MATURITY) {
    monthly_payout_profit = minInv * (profit / 100)
    monthly_payout_capital = minInv * (capital / 100)
    monthly_payout_total = monthly_payout_profit + monthly_payout_capital
  }

  if (planType === PLAN_TYPES.MONTHLY_ONLY) {
    total_received = !Number.isNaN(dur) && dur > 0 ? monthly_payout_total * dur : null
  } else if (planType === PLAN_TYPES.MATURITY_ONLY) {
    total_received = maturity_amount
  } else if (planType === PLAN_TYPES.MONTHLY_AND_MATURITY) {
    const monthlyPart = !Number.isNaN(dur) && dur > 0 ? monthly_payout_total * dur : 0
    total_received = maturity_amount != null ? monthlyPart + maturity_amount : null
    total_profit =
      maturity_amount != null && !Number.isNaN(dur) && dur > 0
        ? monthly_payout_profit * dur + (maturity_amount - minInv)
        : null
  }

  return {
    monthly_payout_profit: planType === PLAN_TYPES.MATURITY_ONLY ? 0 : monthly_payout_profit,
    monthly_payout_capital: planType === PLAN_TYPES.MATURITY_ONLY ? 0 : monthly_payout_capital,
    monthly_payout_total: planType === PLAN_TYPES.MATURITY_ONLY ? 0 : monthly_payout_total,
    maturity_amount: planType === PLAN_TYPES.MONTHLY_ONLY ? null : maturity_amount,
    total_received,
    total_profit,
  }
}

/** Infer plan_type from API plan (has_monthly_payout, has_maturity_amount) */
export function inferPlanType(plan) {
  const ret = plan?.returns ?? {}
  const hasMonthly = !!ret.has_monthly_payout
  const hasMaturity = !!ret.has_maturity_amount
  if (hasMonthly && !hasMaturity) return PLAN_TYPES.MONTHLY_ONLY
  if (!hasMonthly && hasMaturity) return PLAN_TYPES.MATURITY_ONLY
  if (hasMonthly && hasMaturity) return PLAN_TYPES.MONTHLY_AND_MATURITY
  return PLAN_TYPES.MONTHLY_ONLY
}

/** Maturity note template options for dropdown (§5A.2) */
export const MATURITY_NOTE_TEMPLATES = [
  { value: "capital_at_maturity", label: "100% capital at maturity (after {{duration_months}} months)" },
  { value: "capital_doubles", label: "Capital doubles at maturity" },
  { value: "custom", label: "Custom (enter below)" },
]
