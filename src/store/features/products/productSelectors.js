// Product Selectors

import { createSelector } from "@reduxjs/toolkit"
import { selectAllProductsFromAdapter } from "./productSlice"

const selectProductState = (state) => state.products

export const selectAllProducts = selectAllProductsFromAdapter

export const selectProductById = (id) => (state) =>
  state.products.entities[id]

export const selectProductsLoading = createSelector(
  [selectProductState],
  (products) => products.loading
)

export const selectProductsUpdating = createSelector(
  [selectProductState],
  (products) => products.updating
)

export const selectProductsError = createSelector(
  [selectProductState],
  (products) => products.error
)

export const selectProductFilters = createSelector(
  [selectProductState],
  (products) => products.filters
)

export const selectSelectedProduct = createSelector(
  [selectProductState],
  (products) => products.selectedProduct
)

export const selectFilteredProducts = createSelector(
  [selectAllProductsFromAdapter, selectProductFilters],
  (products, filters) => {
    let filtered = [...products]
    
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((p) => p.status === filters.status)
    }
    
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((p) => p.type === filters.type)
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(search) ||
          p.productId?.toLowerCase().includes(search)
      )
    }
    
    return filtered
  }
)

export const selectActiveProducts = createSelector(
  [selectAllProductsFromAdapter],
  (products) => products.filter((p) => p.status === "active")
)
