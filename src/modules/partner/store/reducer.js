// partnerReducers.js
import { combineReducers } from "@reduxjs/toolkit" 
import dashboardReducer from "./features/dashboard/dashboardSlice"
import goalsReducer from "./features/goals/goalSlice"
import leaderboardReducer from "./features/leaderboard/leaderboardSlice"
import authReducer from "./features/auth/authSlice"
import profileReducer from "./features/profile/profileSlice"


export default combineReducers({  
  auth: authReducer,
  dashboard: dashboardReducer, 
  goals: goalsReducer,
  leaderboard: leaderboardReducer,
   profile: profileReducer
})