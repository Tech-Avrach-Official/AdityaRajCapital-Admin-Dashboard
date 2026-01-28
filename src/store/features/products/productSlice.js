// Product Slice - Product state management

import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { fetchProducts, fetchProductById, updateProductCommission } from "./productThunks"

const productsAdapter = createEntityAdapter({
  selectId: (product) => product.id,
})

const initialState = productsAdapter.getInitialState({
  selectedId: null,
  selectedProduct: null,
  loading: false,
  updating: false,
  error: null,
  
  filters: {
    search: "",
    status: "all",
    type: "all",
  },
})

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedId = action.payload?.id || action.payload
      state.selectedProduct = action.payload
    },
    clearSelectedProduct: (state) => {
      state.selectedId = null
      state.selectedProduct = null
    },
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearProductFilters: (state) => {
      state.filters = initialState.filters
    },
    clearProductError: (state) => {
      state.error = null
    },
    resetProducts: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        productsAdapter.setAll(state, action.payload.data)
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          productsAdapter.upsertOne(state, action.payload)
          state.selectedProduct = action.payload
          state.selectedId = action.payload.id
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    builder
      .addCase(updateProductCommission.pending, (state) => {
        state.updating = true
      })
      .addCase(updateProductCommission.fulfilled, (state, action) => {
        state.updating = false
        if (action.payload) {
          productsAdapter.upsertOne(state, action.payload)
        }
      })
      .addCase(updateProductCommission.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })
  },
})

export const {
  setSelectedProduct,
  clearSelectedProduct,
  setProductFilters,
  clearProductFilters,
  clearProductError,
  resetProducts,
} = productSlice.actions

export const {
  selectAll: selectAllProductsFromAdapter,
  selectById: selectProductByIdFromAdapter,
  selectIds: selectProductIds,
} = productsAdapter.getSelectors((state) => state.products)

export default productSlice.reducer
