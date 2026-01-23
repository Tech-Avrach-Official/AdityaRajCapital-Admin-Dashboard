// Products Service - Mock implementation

import { mockProducts } from "@/lib/mockData/products"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const productsService = {
  async getProducts(params = {}) {
    await delay(500)
    let data = [...mockProducts]

    if (params.status) {
      data = data.filter((p) => p.status === params.status)
    }

    if (params.type) {
      data = data.filter((p) => p.type === params.type)
    }

    if (params.search) {
      const search = params.search.toLowerCase()
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search)
      )
    }

    return {
      data,
      total: data.length,
    }
  },

  async getProduct(id) {
    await delay(300)
    return mockProducts.find((p) => p.id === id) || null
  },

  async updateCommission(id, newRate, reason = "") {
    await delay(1000) // Simulate 2FA delay
    const product = mockProducts.find((p) => p.id === id)
    if (product) {
      const oldRate = product.commissionRate
      product.commissionRate = newRate
      return {
        ...product,
        commissionHistory: [
          ...(product.commissionHistory || []),
          {
            oldRate,
            newRate,
            reason,
            changedBy: "Super Admin",
            changedAt: new Date().toISOString(),
          },
        ],
      }
    }
    throw new Error("Product not found")
  },
}
