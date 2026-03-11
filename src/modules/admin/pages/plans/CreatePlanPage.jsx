import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { plansService } from "@/modules/admin/api/services/plansService"
import { handleApiError } from "@/lib/utils/errorHandler"
import PlanForm from "./components/PlanForm"

const CreatePlanPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState(null)

  const handleSubmit = async (body) => {
    setLoading(true)
    setApiErrors(null)
    try {
      const plan = await plansService.createPlan(body)
      toast.success("Plan created successfully")
      navigate(`/admin/plans/${plan.id}`)
    } catch (err) {
      const data = err?.response?.data ?? err?.data
      const errors = data?.errors
      if (Array.isArray(errors) && errors.length > 0) {
        setApiErrors(errors)
      }
      handleApiError(err, "Failed to create plan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/plans")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new investment plan. Slug must be unique (lowercase, numbers, hyphens only).
        </p>
      </div>

      {apiErrors && apiErrors.length > 0 && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive mb-2">Please fix the following:</p>
          <ul className="list-disc list-inside text-sm text-destructive space-y-1">
            {apiErrors.map((e, i) => (
              <li key={i}>
                {typeof e === "string" ? e : e?.message || e?.field || JSON.stringify(e)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <PlanForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/plans")}
        submitLabel="Create plan"
        loading={loading}
      />
    </div>
  )
}

export default CreatePlanPage
