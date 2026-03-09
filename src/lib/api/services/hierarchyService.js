/**
 * Hierarchy Service - Nations, States, Branches
 * See docs/HIERARCHY_FRONTEND_GUIDE.md
 */

import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"

const { hierarchy } = endpoints

export const hierarchyService = {
  // ===================== Nations =====================
  async getNations() {
    const response = await apiClient.get(hierarchy.nations.list)
    const data = response.data?.data
    return {
      nations: data?.nations ?? [],
    }
  },

  async getNation(id) {
    const response = await apiClient.get(hierarchy.nations.get(id))
    return response.data?.data?.nation ?? null
  },

  async createNation(body) {
    const response = await apiClient.post(hierarchy.nations.create, body)
    return response.data
  },

  async updateNation(id, body) {
    const response = await apiClient.put(hierarchy.nations.update(id), body)
    return response.data
  },

  async deleteNation(id) {
    const response = await apiClient.delete(hierarchy.nations.delete(id))
    return response.data
  },

  // ===================== States =====================
  async getStates(params = {}) {
    const response = await apiClient.get(hierarchy.states.list, { params })
    const data = response.data?.data
    return {
      states: data?.states ?? [],
    }
  },

  async getState(id) {
    const response = await apiClient.get(hierarchy.states.get(id))
    return response.data?.data?.state ?? null
  },

  async assignStateNation(stateId, nationId) {
    const response = await apiClient.patch(hierarchy.states.assignNation(stateId), {
      nation_id: nationId,
    })
    return response.data
  },

  async unassignStateNation(stateId) {
    const response = await apiClient.patch(hierarchy.states.assignNation(stateId), {
      nation_id: null,
    })
    return response.data
  },

  // ===================== Branches =====================
  async getBranches(params = {}) {
    const response = await apiClient.get(hierarchy.branches.list, { params })
    const data = response.data?.data
    return {
      branches: data?.branches ?? [],
    }
  },

  async getBranch(id) {
    const response = await apiClient.get(hierarchy.branches.get(id))
    return response.data?.data?.branch ?? null
  },

  async createBranch(body) {
    const response = await apiClient.post(hierarchy.branches.create, body)
    return response.data
  },

  async updateBranch(id, body) {
    const response = await apiClient.put(hierarchy.branches.update(id), body)
    return response.data
  },

  async deleteBranch(id) {
    const response = await apiClient.delete(hierarchy.branches.delete(id))
    return response.data
  },
}
