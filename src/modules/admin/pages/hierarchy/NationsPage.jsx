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
import { hierarchyService } from "@/modules/admin/api/services/hierarchyService"
import { handleApiError } from "@/lib/utils/errorHandler"

const NationsPage = () => {
  const [nations, setNations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingNation, setEditingNation] = useState(null)
  const [deleteNation, setDeleteNation] = useState(null)
  const [name, setName] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState(null)

  const loadNations = async () => {
    setLoading(true)
    try {
      const { nations: list } = await hierarchyService.getNations()
      setNations(list ?? [])
    } catch (err) {
      handleApiError(err, "Failed to load nations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNations()
  }, [])

  const openAdd = () => {
    setEditingNation(null)
    setName("")
    setModalOpen(true)
  }

  const openEdit = (nation) => {
    setEditingNation(nation)
    setName(nation?.name ?? "")
    setModalOpen(true)
  }

  const handleSave = async () => {
    const trimmed = name?.trim()
    if (!trimmed) {
      toast.error("Name is required")
      return
    }
    if (trimmed.length > 100) {
      toast.error("Name must be at most 100 characters")
      return
    }
    setSubmitLoading(true)
    try {
      if (editingNation) {
        await hierarchyService.updateNation(editingNation.id, { name: trimmed })
        toast.success("Nation updated successfully")
      } else {
        await hierarchyService.createNation({ name: trimmed })
        toast.success("Nation created successfully")
      }
      setModalOpen(false)
      loadNations()
    } catch (err) {
      handleApiError(err, editingNation ? "Failed to update nation" : "Failed to create nation")
    } finally {
      setSubmitLoading(false)
    }
  }

  const openDelete = (nation) => {
    setDeleteNation(nation)
    setDeleteBlockedMessage(null)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteNation?.id) return
    setDeleteLoading(true)
    setDeleteBlockedMessage(null)
    try {
      await hierarchyService.deleteNation(deleteNation.id)
      toast.success("Nation deleted successfully")
      setDeleteModalOpen(false)
      setDeleteNation(null)
      loadNations()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || ""
      if (msg.toLowerCase().includes("state") && msg.toLowerCase().includes("assign")) {
        setDeleteBlockedMessage(msg)
      } else {
        handleApiError(err, "Failed to delete nation")
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nations"
        description="Manage nations (e.g. North, South, Center). Assign states to nations from the States page."
        action="Add Nation"
        onActionClick={openAdd}
      />

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
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No nations yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                nations.map((nation) => (
                  <TableRow key={nation.id}>
                    <TableCell className="font-medium">{nation.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {nation.created_at
                        ? format(new Date(nation.created_at), "MMM dd, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(nation)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDelete(nation)}
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
            <DialogTitle>{editingNation ? "Edit Nation" : "Add Nation"}</DialogTitle>
            <DialogDescription>
              {editingNation
                ? "Update the nation name (max 100 characters)."
                : "Create a new nation. Name must be unique (max 100 characters)."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nation-name">Name *</Label>
              <Input
                id="nation-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. North, South, Center"
                maxLength={100}
                disabled={submitLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={submitLoading || !name?.trim()}>
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingNation ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Nation</DialogTitle>
            <DialogDescription>
              {deleteNation ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">{deleteNation.name}</span>? This
                  cannot be undone.
                </>
              ) : (
                "Select a nation to delete."
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteBlockedMessage && (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">Cannot delete this nation</p>
              <p className="mt-1 text-muted-foreground">{deleteBlockedMessage}</p>
              <p className="mt-2">Unassign all states from this nation first (States page).</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading || !deleteNation}
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

export default NationsPage
