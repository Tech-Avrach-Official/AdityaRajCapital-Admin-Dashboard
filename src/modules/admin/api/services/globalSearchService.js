/**
 * Global Search Service – aggregates search across admin entities.
 * Used by the header search bar to find RMs, Partners, Investors, Plans, Branches, and Pages.
 */

import { usersService } from "./usersService"
import { plansService } from "./plansService"
import { hierarchyService } from "./hierarchyService"

const MAX_PER_CATEGORY = 8

/** Static admin pages for "Go to page" search. Keywords improve match. */
export const SEARCH_PAGES = [
  { label: "Dashboard", path: "/admin", keywords: "dashboard home" },
  { label: "Nations", path: "/admin/hierarchy/nations", keywords: "hierarchy nations" },
  { label: "States", path: "/admin/hierarchy/states", keywords: "hierarchy states" },
  { label: "Branches", path: "/admin/hierarchy/branches", keywords: "hierarchy branches" },
  { label: "Relationship Managers", path: "/admin/users/rms", keywords: "rms users" },
  { label: "Create RM", path: "/admin/users/rms/new", keywords: "create rm" },
  { label: "Partners", path: "/admin/users/partners", keywords: "partners users" },
  { label: "Investors", path: "/admin/users/investors", keywords: "investors users" },
  { label: "Products", path: "/admin/products", keywords: "products" },
  { label: "Plans", path: "/admin/plans", keywords: "plans" },
  { label: "Create Plan", path: "/admin/plans/new", keywords: "create plan" },
  { label: "Investments", path: "/admin/financial/investments", keywords: "financial investments" },
  { label: "Payouts", path: "/admin/financial/payouts", keywords: "financial payouts" },
  { label: "Upload Bank PDF", path: "/admin/financial/payouts/upload", keywords: "upload bank" },
  { label: "Commissions", path: "/admin/financial/commissions", keywords: "financial commissions" },
  { label: "Upload Commission", path: "/admin/financial/commissions/upload", keywords: "upload commission" },
  { label: "Payment Verification", path: "/admin/financial/payment-verification", keywords: "payment verification" },
  { label: "Settings", path: "/admin/settings", keywords: "settings config" },
  { label: "Audit & Compliance", path: "/admin/audit", keywords: "audit compliance" },
]

function matchPage(query, page) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const label = page.label.toLowerCase()
  const keywords = (page.keywords || "").toLowerCase()
  const searchable = `${label} ${keywords}`
  return searchable.includes(q) || label.includes(q)
}

/**
 * Run all entity searches in parallel. Returns grouped results.
 * @param {string} query - Search term (min 1 char for pages; 2+ for entities)
 * @returns {Promise<{ pages: [], rms: [], partners: [], investors: [], plans: [], branches: [] }>}
 */
export async function runGlobalSearch(query) {
  const q = (query || "").trim()
  const hasQuery = q.length >= 1
  const hasEntityQuery = q.length >= 2

  const result = {
    pages: [],
    rms: [],
    partners: [],
    investors: [],
    plans: [],
    branches: [],
  }

  // Pages: always filter client-side
  if (hasQuery) {
    result.pages = SEARCH_PAGES.filter((p) => matchPage(q, p)).slice(0, MAX_PER_CATEGORY)
  }

  if (!hasEntityQuery) {
    return result
  }

  const searchLower = q.toLowerCase()

  const [rmsRes, partnersRes, investorsRes, plansRes, branchesRes] = await Promise.allSettled([
    usersService.getRMs({ search: q, limit: MAX_PER_CATEGORY }).then((r) => (r.data || []).slice(0, MAX_PER_CATEGORY)),
    usersService.getPartners({ search: q, limit: MAX_PER_CATEGORY }).then((r) => (r.data || []).slice(0, MAX_PER_CATEGORY)),
    usersService
      .getInvestors({ limit: 100 })
      .then(({ data }) => {
        const list = data || []
        return list.filter(
          (i) =>
            (i.name && i.name.toLowerCase().includes(searchLower)) ||
            (i.client_id && String(i.client_id).toLowerCase().includes(searchLower)) ||
            (i.email && i.email.toLowerCase().includes(searchLower))
        ).slice(0, MAX_PER_CATEGORY)
      }),
    plansService
      .getPlans()
      .then((r) => {
        const plans = r.plans || []
        return plans.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(searchLower)) ||
            (p.slug && p.slug.toLowerCase().includes(searchLower))
        ).slice(0, MAX_PER_CATEGORY)
      }),
    hierarchyService
      .getBranches()
      .then(({ branches }) => {
        const list = branches || []
        return list.filter(
          (b) =>
            (b.name && b.name.toLowerCase().includes(searchLower)) ||
            (b.code && String(b.code).toLowerCase().includes(searchLower))
        ).slice(0, MAX_PER_CATEGORY)
      }),
  ])

  result.rms = rmsRes.status === "fulfilled" ? rmsRes.value : []
  result.partners = partnersRes.status === "fulfilled" ? partnersRes.value : []
  result.investors = investorsRes.status === "fulfilled" ? investorsRes.value : []
  result.plans = plansRes.status === "fulfilled" ? plansRes.value : []
  result.branches = branchesRes.status === "fulfilled" ? branchesRes.value : []

  return result
}
