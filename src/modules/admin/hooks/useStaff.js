// useStaff — bundles selectors + dispatchers for one role-plural's staff slice.

import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  selectStaffList,
  selectStaffTotal,
  selectStaffLoading,
  selectStaffById,
  selectStaffCreating,
  selectStaffUpdating,
  selectStaffProcessingId,
} from "@/modules/admin/store/features/staff/staffSelectors"
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
} from "@/modules/admin/store/features/staff/staffThunks"

export const useStaff = (rolePlural) => {
  const dispatch = useAppDispatch()

  const items = useAppSelector(selectStaffList(rolePlural))
  const total = useAppSelector(selectStaffTotal(rolePlural))
  const loading = useAppSelector(selectStaffLoading(rolePlural))
  const creating = useAppSelector(selectStaffCreating)
  const updating = useAppSelector(selectStaffUpdating)
  const processingId = useAppSelector(selectStaffProcessingId)

  const load = useCallback(
    (params) => dispatch(loadStaff({ rolePlural, params })),
    [dispatch, rolePlural]
  )

  const fetchOne = useCallback(
    (id) => dispatch(getStaff({ rolePlural, id })),
    [dispatch, rolePlural]
  )

  const create = useCallback(
    (body) => dispatch(createStaff({ rolePlural, body })),
    [dispatch, rolePlural]
  )

  const updateProfile = useCallback(
    (id, body) => dispatch(updateStaffProfile({ rolePlural, id, body })),
    [dispatch, rolePlural]
  )

  const remove = useCallback(
    (id) => dispatch(deleteStaff({ rolePlural, id })),
    [dispatch, rolePlural]
  )

  const replaceScope = useCallback(
    (id, scope) => dispatch(replaceStaffScope({ rolePlural, id, scope })),
    [dispatch, rolePlural]
  )

  const replacePermissions = useCallback(
    (id, permissions) =>
      dispatch(replaceStaffPermissions({ rolePlural, id, permissions })),
    [dispatch, rolePlural]
  )

  const setStatus = useCallback(
    (id, status) => dispatch(setStaffStatus({ rolePlural, id, status })),
    [dispatch, rolePlural]
  )

  const resetPassword = useCallback(
    (id, newPassword) =>
      dispatch(resetStaffPassword({ rolePlural, id, newPassword })),
    [dispatch, rolePlural]
  )

  const isProcessing = (id) => processingId === id

  return {
    items,
    total,
    loading,
    creating,
    updating,
    processingId,
    isProcessing,
    load,
    fetchOne,
    create,
    updateProfile,
    remove,
    replaceScope,
    replacePermissions,
    setStatus,
    resetPassword,
  }
}

// Selector helper for components that only need a single record.
export const useStaffById = (rolePlural, id) =>
  useAppSelector(selectStaffById(rolePlural, id))

export default useStaff
