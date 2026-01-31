// Custom Hooks - Central export file

// Re-export store hooks
export { useAppDispatch, useAppSelector } from "@/store"

// Feature hooks
export { useAuth } from "./useAuth"
export { useRMs } from "./useRMs"
export { usePartners } from "./usePartners"
export { usePurchases } from "./usePurchases"

// Additional hooks can be added here as needed:
// export { useInvestors } from "./useInvestors"
// export { useProducts } from "./useProducts"
// export { useFinancial } from "./useFinancial"
// export { useKYC } from "./useKYC"
// export { useDashboard } from "./useDashboard"
// export { useUI } from "./useUI"
