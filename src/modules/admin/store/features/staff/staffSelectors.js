// Staff selectors — keyed by rolePlural.

const selectStaffState = (state) => state.admin.staff

const emptyBucket = { items: [], total: 0, byId: {}, loading: false, error: null }

export const selectStaffBucket = (rolePlural) => (state) =>
  selectStaffState(state)?.[rolePlural] || emptyBucket

export const selectStaffList = (rolePlural) => (state) =>
  selectStaffBucket(rolePlural)(state).items

export const selectStaffTotal = (rolePlural) => (state) =>
  selectStaffBucket(rolePlural)(state).total

export const selectStaffLoading = (rolePlural) => (state) =>
  selectStaffBucket(rolePlural)(state).loading

export const selectStaffById = (rolePlural, id) => (state) =>
  selectStaffBucket(rolePlural)(state).byId[id] || null

export const selectStaffCreating = (state) =>
  selectStaffState(state)?.creating || false

export const selectStaffUpdating = (state) =>
  selectStaffState(state)?.updating || false

export const selectStaffProcessingId = (state) =>
  selectStaffState(state)?.processingId || null
