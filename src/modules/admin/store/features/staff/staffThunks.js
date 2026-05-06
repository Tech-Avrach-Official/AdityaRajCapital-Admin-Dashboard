// Staff thunks — all parameterized over rolePlural so a single set of
// reducers handles all four staff role-plurals.

import { createAsyncThunk } from "@reduxjs/toolkit"
import { staffService } from "@/modules/admin/api/services/staffService"

export const loadStaff = createAsyncThunk(
  "staff/list",
  async ({ rolePlural, params } = {}, { rejectWithValue }) => {
    try {
      const { items, total } = await staffService.list(rolePlural, params)
      return { rolePlural, items, total }
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load staff")
    }
  }
)

export const getStaff = createAsyncThunk(
  "staff/get",
  async ({ rolePlural, id }, { rejectWithValue }) => {
    try {
      const staff = await staffService.get(rolePlural, id)
      return { rolePlural, staff }
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load staff")
    }
  }
)

export const createStaff = createAsyncThunk(
  "staff/create",
  async ({ rolePlural, body }, { rejectWithValue }) => {
    try {
      const staff = await staffService.create(rolePlural, body)
      return { rolePlural, staff }
    } catch (error) {
      // Pass through full error so the form can map error_code to fields.
      return rejectWithValue(error)
    }
  }
)

export const updateStaffProfile = createAsyncThunk(
  "staff/updateProfile",
  async ({ rolePlural, id, body }, { rejectWithValue }) => {
    try {
      const staff = await staffService.updateProfile(rolePlural, id, body)
      return { rolePlural, staff }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const deleteStaff = createAsyncThunk(
  "staff/delete",
  async ({ rolePlural, id }, { rejectWithValue }) => {
    try {
      await staffService.softDelete(rolePlural, id)
      return { rolePlural, id }
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to delete staff")
    }
  }
)

export const replaceStaffScope = createAsyncThunk(
  "staff/replaceScope",
  async ({ rolePlural, id, scope }, { rejectWithValue }) => {
    try {
      const staff = await staffService.replaceScope(rolePlural, id, scope)
      return { rolePlural, staff }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const replaceStaffPermissions = createAsyncThunk(
  "staff/replacePermissions",
  async ({ rolePlural, id, permissions }, { rejectWithValue }) => {
    try {
      const staff = await staffService.replacePermissions(
        rolePlural,
        id,
        permissions
      )
      return { rolePlural, staff }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const setStaffStatus = createAsyncThunk(
  "staff/setStatus",
  async ({ rolePlural, id, status }, { rejectWithValue }) => {
    try {
      const staff = await staffService.setStatus(rolePlural, id, status)
      return { rolePlural, staff }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const resetStaffPassword = createAsyncThunk(
  "staff/resetPassword",
  async ({ rolePlural, id, newPassword }, { rejectWithValue }) => {
    try {
      await staffService.resetPassword(rolePlural, id, newPassword)
      return { rolePlural, id }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)
