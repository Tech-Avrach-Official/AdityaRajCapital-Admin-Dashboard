// Staff slice — state.admin.staff is keyed by role-plural so a single slice
// handles admins / nation-heads / state-heads / branch-heads with one set of
// reducers.

import { createSlice } from "@reduxjs/toolkit"
import {
  loadStaff,
  getStaff,
  createStaff,
  updateStaffProfile,
  deleteStaff,
  replaceStaffScope,
  replaceStaffPermissions,
  setStaffStatus,
  resetStaffPassword,
} from "./staffThunks"
import { STAFF_ROLE_PLURALS } from "@/modules/admin/api/services/staffService"

const emptyBucket = () => ({
  items: [],
  total: 0,
  byId: {},
  loading: false,
  error: null,
})

const initialState = {
  ...Object.fromEntries(STAFF_ROLE_PLURALS.map((p) => [p, emptyBucket()])),
  creating: false,
  updating: false,
  // ID being acted on (delete / status / reset-password / scope / permissions)
  // so per-row spinners can target one item.
  processingId: null,
}

const ensureBucket = (state, rolePlural) => {
  if (!state[rolePlural]) state[rolePlural] = emptyBucket()
  return state[rolePlural]
}

const upsertOne = (bucket, staff) => {
  if (!staff) return
  bucket.byId[staff.id] = staff
  const idx = bucket.items.findIndex((s) => s.id === staff.id)
  if (idx >= 0) bucket.items[idx] = staff
  else bucket.items.unshift(staff)
}

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearStaffError: (state, action) => {
      const bucket = state[action.payload]
      if (bucket) bucket.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadStaff.pending, (state, action) => {
        const bucket = ensureBucket(state, action.meta.arg.rolePlural)
        bucket.loading = true
        bucket.error = null
      })
      .addCase(loadStaff.fulfilled, (state, action) => {
        const { rolePlural, items, total } = action.payload
        const bucket = ensureBucket(state, rolePlural)
        bucket.items = items
        bucket.total = total
        bucket.byId = Object.fromEntries(items.map((s) => [s.id, s]))
        bucket.loading = false
      })
      .addCase(loadStaff.rejected, (state, action) => {
        const bucket = ensureBucket(state, action.meta.arg?.rolePlural)
        bucket.loading = false
        bucket.error = action.payload || "Failed to load staff"
      })

    builder.addCase(getStaff.fulfilled, (state, action) => {
      const { rolePlural, staff } = action.payload
      const bucket = ensureBucket(state, rolePlural)
      upsertOne(bucket, staff)
    })

    builder
      .addCase(createStaff.pending, (state) => {
        state.creating = true
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.creating = false
        const { rolePlural, staff } = action.payload
        const bucket = ensureBucket(state, rolePlural)
        upsertOne(bucket, staff)
        bucket.total += 1
      })
      .addCase(createStaff.rejected, (state) => {
        state.creating = false
      })

    builder
      .addCase(updateStaffProfile.pending, (state) => {
        state.updating = true
      })
      .addCase(updateStaffProfile.fulfilled, (state, action) => {
        state.updating = false
        const { rolePlural, staff } = action.payload
        const bucket = ensureBucket(state, rolePlural)
        upsertOne(bucket, staff)
      })
      .addCase(updateStaffProfile.rejected, (state) => {
        state.updating = false
      })

    builder
      .addCase(deleteStaff.pending, (state, action) => {
        state.processingId = action.meta.arg.id
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.processingId = null
        const { rolePlural, id } = action.payload
        const bucket = ensureBucket(state, rolePlural)
        bucket.items = bucket.items.filter((s) => s.id !== id)
        delete bucket.byId[id]
        if (bucket.total > 0) bucket.total -= 1
      })
      .addCase(deleteStaff.rejected, (state) => {
        state.processingId = null
      })

    const updateScopeCase = (thunk) =>
      builder
        .addCase(thunk.pending, (state, action) => {
          state.processingId = action.meta.arg.id
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.processingId = null
          const { rolePlural, staff } = action.payload
          const bucket = ensureBucket(state, rolePlural)
          upsertOne(bucket, staff)
        })
        .addCase(thunk.rejected, (state) => {
          state.processingId = null
        })

    updateScopeCase(replaceStaffScope)
    updateScopeCase(replaceStaffPermissions)
    updateScopeCase(setStaffStatus)

    builder
      .addCase(resetStaffPassword.pending, (state, action) => {
        state.processingId = action.meta.arg.id
      })
      .addCase(resetStaffPassword.fulfilled, (state) => {
        state.processingId = null
      })
      .addCase(resetStaffPassword.rejected, (state) => {
        state.processingId = null
      })
  },
})

export const { clearStaffError } = staffSlice.actions
export default staffSlice.reducer
