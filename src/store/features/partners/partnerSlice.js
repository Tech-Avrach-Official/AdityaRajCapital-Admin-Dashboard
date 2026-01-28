// Partner Slice - Partner state management
// Uses entity adapter for normalized state

import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { fetchPartners, fetchPartnerById, changePartnerRM } from "./partnerThunks"

/**
 * Entity adapter for normalized partner state
 */
const partnersAdapter = createEntityAdapter({
  selectId: (partner) => partner.id,
  sortComparer: (a, b) => {
    const dateA = new Date(a.created_at || a.createdDate || 0)
    const dateB = new Date(b.created_at || b.createdDate || 0)
    return dateB - dateA
  },
})

/**
 * Initial state
 */
const initialState = partnersAdapter.getInitialState({
  selectedId: null,
  selectedPartner: null,
  
  loading: false,
  updating: false,
  error: null,
  
  filters: {
    search: "",
    status: "all",
    rmId: null,
    kycStatus: "all",
  },
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})

/**
 * Partner Slice
 */
const partnerSlice = createSlice({
  name: "partners",
  initialState,
  reducers: {
    setSelectedPartner: (state, action) => {
      state.selectedId = action.payload?.id || action.payload
      state.selectedPartner = action.payload
    },
    clearSelectedPartner: (state) => {
      state.selectedId = null
      state.selectedPartner = null
    },
    setPartnerFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    clearPartnerFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    },
    setPartnerPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearPartnerError: (state) => {
      state.error = null
    },
    resetPartners: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Partners
    builder
      .addCase(fetchPartners.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.loading = false
        partnersAdapter.setAll(state, action.payload.data)
        state.pagination.total = action.payload.total
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Fetch Partner By ID
    builder
      .addCase(fetchPartnerById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPartnerById.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          partnersAdapter.upsertOne(state, action.payload)
          state.selectedPartner = action.payload
          state.selectedId = action.payload.id
        }
      })
      .addCase(fetchPartnerById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Change Partner RM
    builder
      .addCase(changePartnerRM.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(changePartnerRM.fulfilled, (state, action) => {
        state.updating = false
        // Update the partner's RM info in state
        if (action.payload.partner_id) {
          const partner = state.entities[action.payload.partner_id]
          if (partner) {
            partner.rm_id = action.payload.new_rm_id
            partner.rm = {
              rm_id: action.payload.new_rm_id,
              rm_code: action.payload.new_rm_code,
              rm_name: action.payload.new_rm_name,
            }
          }
        }
      })
      .addCase(changePartnerRM.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })
  },
})

// Export actions
export const {
  setSelectedPartner,
  clearSelectedPartner,
  setPartnerFilters,
  clearPartnerFilters,
  setPartnerPagination,
  clearPartnerError,
  resetPartners,
} = partnerSlice.actions

// Export adapter selectors
export const {
  selectAll: selectAllPartnersFromAdapter,
  selectById: selectPartnerByIdFromAdapter,
  selectIds: selectPartnerIds,
  selectEntities: selectPartnerEntities,
} = partnersAdapter.getSelectors((state) => state.partners)

// Export reducer
export default partnerSlice.reducer
