/**
 * Plans Service – Admin Plan CRUD
 * Uses real API: GET/POST /api/admin/plans, GET/PUT/DELETE /api/admin/plans/:id
 */

import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"

export const plansService = {
  /**
   * List all plans (active + inactive). Order: display_order ASC, then id ASC.
   * @returns {Promise<{ plans: Array, total: number }>}
   */
  async getPlans() {
    const response = await apiClient.get(endpoints.plans.list)
    const data = response.data?.data
    if (!data) {
      throw new Error(response.data?.message || "Failed to load plans")
    }
    return {
      plans: data.plans || [],
      total: data.total ?? (data.plans?.length ?? 0),
    }
  },

  /**
   * Get a single plan by ID (for detail/edit). Tries GET :id first; on 404 falls back to list and finds by id.
   * @param {string|number} id – Plan ID
   * @returns {Promise<object>} Plan object
   */
  async getPlan(id) {
    try {
      const response = await apiClient.get(endpoints.plans.get(id))
      const data = response.data?.data
      if (data) return data
    } catch (err) {
      if (err?.response?.status === 404 || err?.status === 404) {
        const { plans } = await this.getPlans()
        const plan = plans?.find((p) => String(p.id) === String(id))
        if (plan) return plan
      }
      throw err
    }
    throw new Error("Plan not found")
  },

  /**
   * Create a new plan. Send full body per spec §5 / §6.
   * @param {object} body – Full create payload (name, slug, returns, investment_details, partner_commission, etc.)
   * @returns {Promise<object>} Created plan (with id, created_at, updated_at)
   */
  async createPlan(body) {
    const response = await apiClient.post(endpoints.plans.create, body)
    const data = response.data?.data
    if (!data) {
      throw new Error(response.data?.message || "Failed to create plan")
    }
    return data
  },

  /**
   * Update plan (partial). Send only fields to change.
   * @param {string|number} id – Plan ID
   * @param {object} body – Partial payload (at least one field)
   * @returns {Promise<object>} Updated plan
   */
  async updatePlan(id, body) {
    const response = await apiClient.put(endpoints.plans.update(id), body)
    const data = response.data?.data
    if (!data) {
      throw new Error(response.data?.message || "Failed to update plan")
    }
    return data
  },

  /**
   * Delete plan. May return 400 if plan has investments – message: deactivate instead.
   * @param {string|number} id – Plan ID
   * @returns {Promise<{ id: number }>}
   */
  async deletePlan(id) {
    const response = await apiClient.delete(endpoints.plans.delete(id))
    const data = response.data?.data
    return data != null ? data : { id: Number(id) }
  },
}
