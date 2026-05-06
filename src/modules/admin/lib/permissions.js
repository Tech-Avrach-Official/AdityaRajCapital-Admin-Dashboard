// Permission catalog, helpers, and JWT decoding for the Staff RBAC system.
// Catalog mirrors docs/STAFF_API_REFERENCE.md Part 4 — keep in sync.

import { jwtDecode } from "jwt-decode"

export const PERMISSION_CATALOG = {
  dashboard: ["dashboard.view"],
  "hierarchy.nations": [
    "hierarchy.nations.view",
    "hierarchy.nations.create",
    "hierarchy.nations.update",
    "hierarchy.nations.delete",
  ],
  "hierarchy.states": [
    "hierarchy.states.view",
    "hierarchy.states.assign-nation",
  ],
  "hierarchy.branches": [
    "hierarchy.branches.view",
    "hierarchy.branches.create",
    "hierarchy.branches.update",
    "hierarchy.branches.delete",
  ],
  rms: [
    "rms.view",
    "rms.create",
    "rms.update",
    "rms.delete",
    "rms.view-investors",
    "rms.view-partners",
    "rms.view-visits",
    "rms.view-commissions",
  ],
  partners: [
    "partners.view",
    "partners.update",
    "partners.update-rm",
    "partners.view-kyc",
    "partners.view-nominee",
  ],
  investors: [
    "investors.view",
    "investors.view-kyc",
    "investors.view-nominees",
    "investors.view-bank-accounts",
    "investors.view-purchases",
  ],
  plans: [
    "plans.view",
    "plans.create",
    "plans.update",
    "plans.delete",
  ],
  purchases: [
    "purchases.view",
    "purchases.approve",
    "purchases.reject",
  ],
  investments: ["investments.view"],
  payouts: ["payouts.view", "payouts.mark-paid"],
  commissions: ["commissions.view", "commissions.mark-paid"],
  "tds-settings": ["tds-settings.view", "tds-settings.update"],
  "deletion-requests": [
    "deletion-requests.view",
    "deletion-requests.process",
  ],
  "staff.admin": [
    "staff.admin.view",
    "staff.admin.create",
    "staff.admin.update",
    "staff.admin.delete",
    "staff.admin.assign-scope",
    "staff.admin.assign-permissions",
    "staff.admin.reset-password",
  ],
  "staff.nation-head": [
    "staff.nation-head.view",
    "staff.nation-head.create",
    "staff.nation-head.update",
    "staff.nation-head.delete",
    "staff.nation-head.assign-scope",
    "staff.nation-head.assign-permissions",
    "staff.nation-head.reset-password",
  ],
  "staff.state-head": [
    "staff.state-head.view",
    "staff.state-head.create",
    "staff.state-head.update",
    "staff.state-head.delete",
    "staff.state-head.assign-scope",
    "staff.state-head.assign-permissions",
    "staff.state-head.reset-password",
  ],
  "staff.branch-head": [
    "staff.branch-head.view",
    "staff.branch-head.create",
    "staff.branch-head.update",
    "staff.branch-head.delete",
    "staff.branch-head.assign-scope",
    "staff.branch-head.assign-permissions",
    "staff.branch-head.reset-password",
  ],
}

export const ALL_PERMISSIONS = Object.values(PERMISSION_CATALOG).flat()

export const MODULE_LABELS = {
  dashboard: "Dashboard",
  "hierarchy.nations": "Hierarchy — Nations",
  "hierarchy.states": "Hierarchy — States",
  "hierarchy.branches": "Hierarchy — Branches",
  rms: "Relationship Managers",
  partners: "Partners",
  investors: "Investors",
  plans: "Plans",
  purchases: "Purchases",
  investments: "Investments",
  payouts: "Payouts",
  commissions: "Commissions",
  "tds-settings": "TDS Settings",
  "deletion-requests": "Deletion Requests",
  "staff.admin": "Staff — Admins",
  "staff.nation-head": "Staff — Nation Heads",
  "staff.state-head": "Staff — State Heads",
  "staff.branch-head": "Staff — Branch Heads",
}

// Mirrors backend hasPermission: '*' wildcard, exact match, then 'module.*' wildcard.
export function hasPermission(held, required) {
  if (!Array.isArray(held) || !required) return false
  if (held.includes("*")) return true
  if (held.includes(required)) return true
  for (const h of held) {
    if (h.endsWith(".*") && required.startsWith(h.slice(0, -1))) return true
  }
  return false
}

const EMPTY_SCOPE = { nations: [], states: [], branches: [] }

export function decodeStaffToken(token) {
  if (!token) return null
  try {
    const payload = jwtDecode(token)
    return {
      id: payload.id ?? null,
      role: payload.role ?? null,
      email: payload.email ?? null,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
      scope: { ...EMPTY_SCOPE, ...(payload.scope || {}) },
      exp: typeof payload.exp === "number" ? payload.exp : null,
      version: payload.version ?? null,
    }
  } catch {
    return null
  }
}

export function isStaffTokenExpired(exp) {
  if (!exp) return true
  return exp * 1000 <= Date.now()
}
