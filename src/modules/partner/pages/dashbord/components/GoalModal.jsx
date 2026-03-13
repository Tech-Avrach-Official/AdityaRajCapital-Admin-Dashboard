import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import axios from "axios"

const GoalModal = ({ open, setOpen, goal }) => {

  const [target, setTarget] = useState(goal.target)

  const handleUpdate = async () => {
    try {

      await axios.post("/api/partner/goals", {
        id: goal.id,
        goal_type: goal.goal_type,
        period_type: goal.period_type,
        period: goal.period,
        target
      })

      setOpen(false)
      window.location.reload()

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Update Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <label className="text-sm">
              Target
            </label>

            <input
              type="number"
              className="w-full border rounded p-2 mt-1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          <Button onClick={handleUpdate}>
            Save
          </Button>

        </div>

      </DialogContent>

    </Dialog>
  )
}

export default GoalModal