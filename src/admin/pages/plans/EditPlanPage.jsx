import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { plansService } from "@/lib/api/services"
import { handleApiError } from "@/lib/utils/errorHandler"
import PlanForm from "./components/PlanForm"

const EditPlanPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apiErrors, setApiErrors] = useState(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    plansService
      .getPlan(id)
      .then((data) => {
        if (!cancelled) setPlan(data)
      })
      .catch((err) => {
        if (!cancelled) {
          handleApiError(err, "Failed to load plan")
          setPlan(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  const handleSubmit = async (body) => {
    if (!id || Object.keys(body).length === 0) return
    setSaving(true)
    setApiErrors(null)
    try {
      const updated = await plansService.updatePlan(id, body)
      setPlan(updated)
      toast.success("Plan updated successfully")
      navigate(`/admin/plans/${id}`)
    } catch (err) {
      const data = err?.response?.data ?? err?.data
      const errors = data?.errors
      if (Array.isArray(errors) && errors.length > 0) {
        setApiErrors(errors)
      }
      handleApiError(err, "Failed to update plan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/admin/plans")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        <p className="text-muted-foreground">Plan not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/plans/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to plan
        </Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {plan.name} — only changed fields will be sent.
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
        mode="edit"
        initialPlan={plan}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/admin/plans/${id}`)}
        submitLabel="Update plan"
        loading={saving}
      />
    </div>
  )
}

export default EditPlanPage
