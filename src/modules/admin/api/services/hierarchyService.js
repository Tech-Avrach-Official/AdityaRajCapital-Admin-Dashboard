/**
 * Hierarchy Service - Nations, States, Branches
 * See docs/HIERARCHY_FRONTEND_GUIDE.md
 */

import { adminApiClient } from "../client"
import { endpoints } from "../endpoints"

const { hierarchy } = endpoints

export const hierarchyService = {
  // ===================== Nations =====================
  async getNations() {
    const response = await adminApiClient.get(hierarchy.nations.list)
    const data = response.data?.data
    return {
      nations: data?.nations ?? [],
    }
  },

  async getNation(id) {
    const response = await adminApiClient.get(hierarchy.nations.get(id))
    return response.data?.data?.nation ?? null
  },

  async createNation(body) {
    const response = await adminApiClient.post(hierarchy.nations.create, body)
    return response.data
  },

  async updateNation(id, body) {
    const response = await adminApiClient.put(hierarchy.nations.update(id), body)
    return response.data
  },

  async deleteNation(id) {
    const response = await adminApiClient.delete(hierarchy.nations.delete(id))
    return response.data
  },

  // ===================== States =====================
  async getStates(params = {}) {
    const response = await adminApiClient.get(hierarchy.states.list, { params })
    const data = response.data?.data
    return {
      states: data?.states ?? [],
    }
  },

  async getState(id) {
    const response = await adminApiClient.get(hierarchy.states.get(id))
    return response.data?.data?.state ?? null
  },

  async assignStateNation(stateId, nationId) {
    const response = await adminApiClient.patch(hierarchy.states.assignNation(stateId), {
      nation_id: nationId,
    })
    return response.data
  },

  async unassignStateNation(stateId) {
    const response = await adminApiClient.patch(hierarchy.states.assignNation(stateId), {
      nation_id: null,
    })
    return response.data
  },

  // ===================== Branches =====================
  async getBranches(params = {}) {
    const response = await adminApiClient.get(hierarchy.branches.list, { params })
    const data = response.data?.data
    return {
      branches: data?.branches ?? [],
    }
  },

  async getBranch(id) {
    const response = await adminApiClient.get(hierarchy.branches.get(id))
    return response.data?.data?.branch ?? null
  },

  async createBranch(body) {
    const response = await adminApiClient.post(hierarchy.branches.create, body)
    return response.data
  },

  async updateBranch(id, body) {
    const response = await adminApiClient.put(hierarchy.branches.update(id), body)
    return response.data
  },

  async deleteBranch(id) {
    const response = await adminApiClient.delete(hierarchy.branches.delete(id))
    return response.data
  },
}
