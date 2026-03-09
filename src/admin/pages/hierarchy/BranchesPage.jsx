import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { hierarchyService } from "@/lib/api/services"
import { handleApiError } from "@/lib/utils/errorHandler"

const BranchesPage = () => {
  const [branches, setBranches] = useState([])
  const [states, setStates] = useState([])
  const [nations, setNations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [deleteBranch, setDeleteBranch] = useState(null)
  const [stateId, setStateId] = useState("")
  const [name, setName] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState(null)
  const [stateFilterId, setStateFilterId] = useState("all")
  const [nationFilterId, setNationFilterId] = useState("all")

  const loadBranches = async () => {
    setLoading(true)
    try {
      const params = {}
      if (stateFilterId && stateFilterId !== "all") params.state_id = stateFilterId
      if (nationFilterId && nationFilterId !== "all") params.nation_id = nationFilterId
      const { branches: list } = await hierarchyService.getBranches(params)
      setBranches(list ?? [])
    } catch (err) {
      handleApiError(err, "Failed to load branches")
    } finally {
      setLoading(false)
    }
  }

  const loadStates = async () => {
    try {
      const { states: list } = await hierarchyService.getStates()
      setStates(list ?? [])
    } catch (err) {
      handleApiError(err, "Failed to load states")
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
    loadStates()
    loadNations()
  }, [])

  useEffect(() => {
    loadBranches()
  }, [stateFilterId, nationFilterId])

  const openAdd = () => {
    setEditingBranch(null)
    setStateId("")
    setName("")
    setModalOpen(true)
  }

  const openEdit = (branch) => {
    setEditingBranch(branch)
    setStateId(branch?.state_id != null ? String(branch.state_id) : "")
    setName(branch?.name ?? "")
    setModalOpen(true)
  }

  const handleSave = async () => {
    const trimmed = name?.trim()
    if (!trimmed) {
      toast.error("Name is required")
      return
    }
    if (trimmed.length > 255) {
      toast.error("Name must be at most 255 characters")
      return
    }
    if (!editingBranch && !stateId) {
      toast.error("State is required")
      return
    }
    setSubmitLoading(true)
    try {
      if (editingBranch) {
        await hierarchyService.updateBranch(editingBranch.id, { name: trimmed })
        toast.success("Branch updated successfully")
      } else {
        await hierarchyService.createBranch({ state_id: Number(stateId), name: trimmed })
        toast.success("Branch created successfully")
      }
      setModalOpen(false)
      loadBranches()
    } catch (err) {
      handleApiError(
        err,
        editingBranch ? "Failed to update branch" : "Failed to create branch"
      )
    } finally {
      setSubmitLoading(false)
    }
  }

  const openDelete = (branch) => {
    setDeleteBranch(branch)
    setDeleteBlockedMessage(null)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteBranch?.id) return
    setDeleteLoading(true)
    setDeleteBlockedMessage(null)
    try {
      await hierarchyService.deleteBranch(deleteBranch.id)
      toast.success("Branch deleted successfully")
      setDeleteModalOpen(false)
      setDeleteBranch(null)
      loadBranches()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || ""
      if (
        (msg.toLowerCase().includes("rm") && msg.toLowerCase().includes("assign")) ||
        msg.toLowerCase().includes("reassign")
      ) {
        setDeleteBlockedMessage(msg)
      } else {
        handleApiError(err, "Failed to delete branch")
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description="Manage branches under each state. RMs are assigned to a branch."
        action="Add Branch"
        onActionClick={openAdd}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border">
        <Label className="text-sm text-muted-foreground">Filter</Label>
        <Select value={nationFilterId} onValueChange={setNationFilterId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Nation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All nations</SelectItem>
            {nations.map((n) => (
              <SelectItem key={n.id} value={String(n.id)}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stateFilterId} onValueChange={setStateFilterId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {states.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
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
                <TableHead>Branch</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Nation</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No branches yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell className="text-sm">{branch.state_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {branch.nation_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {branch.created_at
                        ? format(new Date(branch.created_at), "MMM dd, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(branch)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDelete(branch)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</DialogTitle>
            <DialogDescription>
              {editingBranch
                ? "Update the branch name. Name must be unique within the state."
                : "Create a new branch under a state. Name is unique per state (max 255 characters)."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingBranch && (
              <div className="space-y-2">
                <Label>State *</Label>
                <Select
                  value={stateId}
                  onValueChange={setStateId}
                  disabled={submitLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name *</Label>
              <Input
                id="branch-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mumbai Main, Pune Central"
                maxLength={255}
                disabled={submitLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                submitLoading ||
                !name?.trim() ||
                (!editingBranch && !stateId)
              }
            >
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingBranch ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              {deleteBranch ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">{deleteBranch.name}</span>? This
                  cannot be undone.
                </>
              ) : (
                "Select a branch to delete."
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteBlockedMessage && (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">Cannot delete this branch</p>
              <p className="mt-1 text-muted-foreground">{deleteBlockedMessage}</p>
              <p className="mt-2">Reassign or remove RMs from this branch first.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading || !deleteBranch}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BranchesPage
