// Product Thunks - Async actions for product management

import { createAsyncThunk } from "@reduxjs/toolkit"
import { productsService } from "@/lib/api/services/productsService"

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await productsService.getProducts(params)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch products")
    }
  }
)

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const product = await productsService.getProduct(id)
      return product
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch product")
    }
  }
)

export const updateProductCommission = createAsyncThunk(
  "products/updateProductCommission",
  async ({ id, commission }, { rejectWithValue }) => {
    try {
      const result = await productsService.updateCommission(id, commission)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update commission")
    }
  }
)
