import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchGoals } from "../../../store/features/goals/goalThunk"
import GoalCard from "./GoalCard"

const GoalsSection = () => {

  const dispatch = useDispatch()

  const { goals } = useSelector(
    state => state.partner.goals
  )

  const monthlyGoals = goals.filter(
    g => g.period_type === "monthly"
  )

  const yearlyGoals = goals.filter(
    g => g.period_type === "yearly"
  )

  useEffect(() => {
    dispatch(fetchGoals())
  }, [dispatch])

  return (
    <div className="mt-10 space-y-8">

      <h2 className="text-xl font-semibold">
        Goals
      </h2>

      <div>
        <h3 className="text-lg mb-4">Monthly Goals</h3>

        <div className="grid grid-cols-2 gap-5">
          {monthlyGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Yearly Goals</h3>

        <div className="grid grid-cols-2 gap-5">
          {yearlyGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

    </div>
  )
}

export default GoalsSection