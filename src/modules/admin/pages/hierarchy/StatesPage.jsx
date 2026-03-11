import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Pencil, Loader2 } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { hierarchyService } from "@/modules/admin/api/services/hierarchyService"
import { handleApiError } from "@/lib/utils/errorHandler"

const StatesPage = () => {
  const [states, setStates] = useState([])
  const [nations, setNations] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedState, setSelectedState] = useState(null)
  const [selectedNationId, setSelectedNationId] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [nationFilterId, setNationFilterId] = useState("all")

  const loadStates = async () => {
    setLoading(true)
    try {
      const params = nationFilterId && nationFilterId !== "all" ? { nation_id: nationFilterId } : {}
      const { states: list } = await hierarchyService.getStates(params)
      setStates(list ?? [])
    } catch (err) {
      handleApiError(err, "Failed to load states")
    } finally {
      setLoading(false)
    }
  }

  const loadNations = async () => {
    try {
      const { nations: list } = await hierarchyService.getNations()
      setNations(list ?? [])
    } catch (err) {
      handleApiError(err, "Failed to load nations")
    }
  }

  useEffect(() => {
    loadNations()
  }, [])

  useEffect(() => {
    loadStates()
  }, [nationFilterId])

  const openAssign = (state) => {
    setSelectedState(state)
    setSelectedNationId(state?.nation_id != null ? String(state.nation_id) : "none")
    setAssignModalOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedState?.id) return
    setSubmitLoading(true)
    try {
      const nationId = selectedNationId === "none" ? null : Number(selectedNationId)
      if (nationId === null) {
        await hierarchyService.unassignStateNation(selectedState.id)
        toast.success("Nation unassigned successfully")
      } else {
        await hierarchyService.assignStateNation(selectedState.id, nationId)
        toast.success("Nation assigned successfully")
      }
      setAssignModalOpen(false)
      setSelectedState(null)
      loadStates()
    } catch (err) {
      handleApiError(err, "Failed to update state nation")
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="States"
        description="Pre-seeded Indian states/UTs. Assign or unassign each state to a nation."
      />

      {/* Filter by nation */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border">
        <Label className="text-sm text-muted-foreground">Filter by nation</Label>
        <Select value={nationFilterId} onValueChange={setNationFilterId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All nations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {nations.map((n) => (
              <SelectItem key={n.id} value={String(n.id)}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="rounded-md border p-4">
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead>Nation</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {states.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No states found.
                  </TableCell>
                </TableRow>
              ) : (
                states.map((state) => (
                  <TableRow key={state.id}>
                    <TableCell className="font-medium">{state.name}</TableCell>
                    <TableCell>
                      {state.nation_name ? (
                        <span className="text-sm">{state.nation_name}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">— Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {state.updated_at
                        ? format(new Date(state.updated_at), "MMM dd, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssign(state)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Assign Nation
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Assign Nation Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Nation to State</DialogTitle>
            <DialogDescription>
              {selectedState ? (
                <>
                  Choose a nation for <span className="font-medium text-foreground">{selectedState.name}</span>.
                  Select "Unassigned" to remove the current nation.
                </>
              ) : (
                "Select a state first."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nation</Label>
              <Select
                value={selectedNationId}
                onValueChange={setSelectedNationId}
                disabled={submitLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {nations.map((n) => (
                    <SelectItem key={n.id} value={String(n.id)}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={submitLoading || !selectedState}>
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StatesPage
