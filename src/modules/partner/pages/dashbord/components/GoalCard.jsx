import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import GoalModal from "./GoalModal"
import axios from "axios"

const GoalCard = ({ goal }) => {

  const [open, setOpen] = useState(false)

  const progress =
    goal.achieved && goal.target
      ? Math.min((goal.achieved / goal.target) * 100, 100)
      : 0

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/partner/goals/${goal.id}`)
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">

      <div className="flex justify-between items-start">

        <div>
          <h4 className="font-semibold capitalize">
            {goal.goal_type} Goal
          </h4>

          <p className="text-sm text-gray-500">
            Target: {goal.target}
          </p>

          <p className="text-sm text-gray-500">
            Achieved: {goal.achieved || 0}
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>
            Edit
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>

      </div>

      {/* Progress Bar */}

      <div className="mt-4">
        <div className="w-full bg-gray-200 h-2 rounded">

          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${progress}%` }}
          />

        </div>

        <p className="text-xs text-gray-500 mt-1">
          {progress.toFixed(1)}% completed
        </p>
      </div>

      <GoalModal
        open={open}
        setOpen={setOpen}
        goal={goal}
      />

    </div>
  )
}

export default GoalCard