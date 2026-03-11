import { useDispatch, useSelector } from "react-redux"
import { createStore } from "./configureStore"

export const store = createStore()
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector
export default store
