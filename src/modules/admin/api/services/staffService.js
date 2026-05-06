/**
 * Staff Service — Phase 1+2+3 of Staff RBAC.
 * One factory parameterized over rolePlural in {admins, nation-heads,
 * state-heads, branch-heads}. See docs/STAFF_API_REFERENCE.md.
 *
 * Notes:
 * - Replace-scope and replace-permissions are **wholesale** PATCHes; UI must
 *   GET /:id first to pre-fill.
 * - The list `total` is scope-narrowed for non-super-admin callers — never
 *   label it "total in system".
 * - 404 from /:id may mean "exists but outside your scope" rather than truly
 *   missing — surface a generic message.
 */

import { adminApiClient } from "../client"
import { endpoints } from "../endpoints"

export const STAFF_ROLE_PLURALS = [
  "admins",
  "nation-heads",
  "state-heads",
  "branch-heads",
]

// Map role -> rolePlural and back.
export const ROLE_TO_PLURAL = {
  admin: "admins",
  nation_head: "nation-heads",
  state_head: "state-heads",
  branch_head: "branch-heads",
}

export const PLURAL_TO_ROLE = {
  admins: "admin",
  "nation-heads": "nation_head",
  "state-heads": "state_head",
  "branch-heads": "branch_head",
}

export const PLURAL_LABELS = {
  admins: "Admins",
  "nation-heads": "Nation Heads",
  "state-heads": "State Heads",
  "branch-heads": "Branch Heads",
}

// What scope shape each role expects.
export const ROLE_SCOPE_KEY = {
  admin: "nations",
  nation_head: "nations",
  state_head: "states",
  branch_head: "branches",
}

const requireValidPlural = (rolePlural) => {
  if (!STAFF_ROLE_PLURALS.includes(rolePlural)) {
    throw new Error(`Invalid staff role-plural: ${rolePlural}`)
  }
}

export const staffService = {
  async list(rolePlural, params = {}) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.get(
      endpoints.staff.list(rolePlural),
      { params }
    )
    const data = response.data?.data ?? {}
    return {
      items: data.staff ?? [],
      total: data.total ?? 0,
    }
  },

  async get(rolePlural, id) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.get(endpoints.staff.get(rolePlural, id))
    return response.data?.data ?? null
  },

  async create(rolePlural, body) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.post(
      endpoints.staff.create(rolePlural),
      body
    )
    return response.data?.data ?? response.data
  },

  async updateProfile(rolePlural, id, body) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.put(
      endpoints.staff.update(rolePlural, id),
      body
    )
    return response.data?.data ?? response.data
  },

  async softDelete(rolePlural, id) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.delete(
      endpoints.staff.delete(rolePlural, id)
    )
    return response.data
  },

  async replaceScope(rolePlural, id, scope) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.patch(
      endpoints.staff.scope(rolePlural, id),
      scope
    )
    return response.data?.data ?? response.data
  },

  async replacePermissions(rolePlural, id, permissions) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.patch(
      endpoints.staff.permissions(rolePlural, id),
      { permissions }
    )
    return response.data?.data ?? response.data
  },

  async setStatus(rolePlural, id, status) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.patch(
      endpoints.staff.status(rolePlural, id),
      { status }
    )
    return response.data?.data ?? response.data
  },

  async resetPassword(rolePlural, id, newPassword) {
    requireValidPlural(rolePlural)
    const response = await adminApiClient.post(
      endpoints.staff.resetPassword(rolePlural, id),
      { new_password: newPassword }
    )
    return response.data
  },
}
