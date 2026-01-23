import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PageHeader from "@/components/common/PageHeader"
import FilterBar from "@/components/common/FilterBar"
import RMsTable from "./components/RMsTable"
import CreateRMModal from "./components/CreateRMModal"
import EditRMModal from "./components/EditRMModal"
import RMDetailsModal from "./components/RMDetailsModal"
import AssignPartnersModal from "./components/AssignPartnersModal"
import DeleteConfirmationModal from "./components/DeleteConfirmationModal"
import { usersService } from "@/lib/api/services"

const RMsPage = () => {
  const [rms, setRMs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRM, setSelectedRM] = useState(null)

  useEffect(() => {
    loadRMs()
  }, [searchValue, statusFilter])

  const loadRMs = async () => {
    setLoading(true)
    try {
      const response = await usersService.getRMs({
        search: searchValue,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      setRMs(response.data)
    } catch (error) {
      toast.error("Failed to load RMs")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await usersService.createRM(data)
      toast.success("RM created successfully")
      loadRMs()
    } catch (error) {
      toast.error("Failed to create RM")
    }
  }

  const handleEdit = async (data) => {
    try {
      await usersService.updateRM(selectedRM.id, data)
      toast.success("RM updated successfully")
      loadRMs()
    } catch (error) {
      toast.error("Failed to update RM")
    }
  }

  const handleDelete = async () => {
    try {
      await usersService.deleteRM(selectedRM.id)
      toast.success("RM deleted successfully")
      loadRMs()
    } catch (error) {
      toast.error("Failed to delete RM")
    }
  }

  const handleAssignPartners = async (partnerIds) => {
    try {
      // Mock implementation - update partner assignments
      toast.success(`${partnerIds.length} partner(s) assigned successfully`)
      loadRMs()
    } catch (error) {
      toast.error("Failed to assign partners")
    }
  }

  const filters = [
    {
      key: "status",
      value: statusFilter,
      placeholder: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relationship Managers"
        action="Create RM"
        onActionClick={() => setCreateModalOpen(true)}
      />

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by name, email, mobile, referral code..."
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "status") setStatusFilter(value)
        }}
        onClearFilters={() => {
          setSearchValue("")
          setStatusFilter("all")
        }}
      />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <RMsTable
          data={rms}
          onView={(rm) => {
            setSelectedRM(rm)
            setDetailsModalOpen(true)
          }}
          onEdit={(rm) => {
            setSelectedRM(rm)
            setEditModalOpen(true)
          }}
          onDelete={(rm) => {
            setSelectedRM(rm)
            setDeleteModalOpen(true)
          }}
          onAssignPartners={(rm) => {
            setSelectedRM(rm)
            setAssignModalOpen(true)
          }}
        />
      )}

      <CreateRMModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
      />

      <EditRMModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        rm={selectedRM}
        onSubmit={handleEdit}
      />

      <RMDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        rm={selectedRM}
      />

      <AssignPartnersModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        rm={selectedRM}
        onSubmit={handleAssignPartners}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        entity={selectedRM}
        entityName="RM"
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default RMsPage
