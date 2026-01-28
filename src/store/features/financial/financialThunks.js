// Financial Thunks - Async actions for financial data

import { createAsyncThunk } from "@reduxjs/toolkit"
import { financialService } from "@/lib/api/services/financialService"

export const fetchInvestments = createAsyncThunk(
  "financial/fetchInvestments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await financialService.getInvestments(params)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch investments")
    }
  }
)

export const fetchPayouts = createAsyncThunk(
  "financial/fetchPayouts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await financialService.getPayouts(params)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch payouts")
    }
  }
)

export const fetchCommissions = createAsyncThunk(
  "financial/fetchCommissions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await financialService.getCommissions(params)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch commissions")
    }
  }
)

export const uploadBankPDF = createAsyncThunk(
  "financial/uploadBankPDF",
  async (file, { rejectWithValue }) => {
    try {
      const result = await financialService.uploadBankPDF(file)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to upload PDF")
    }
  }
)
