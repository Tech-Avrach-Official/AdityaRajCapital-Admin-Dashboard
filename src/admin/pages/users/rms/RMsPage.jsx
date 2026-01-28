import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PageHeader from "@/components/common/PageHeader"
import FilterBar from "@/components/common/FilterBar"
import { Skeleton } from "@/components/ui/skeleton"
import RMsTable from "./components/RMsTable"
import CreateRMModal from "./components/CreateRMModal"
import EditRMModal from "./components/EditRMModal"
import RMDetailsModal from "./components/RMDetailsModal"
import AssignPartnersModal from "./components/AssignPartnersModal"
import DeleteConfirmationModal from "./components/DeleteConfirmationModal"
import { useRMs } from "@/hooks"

const RMsPage = () => {
  // Redux state and actions
  const {
    rms,
    filteredRMs,
    loading,
    filters,
    selectedRM,
    loadRMs,
    selectRM,
    deselectRM,
    updateFilters,
    resetFilters,
  } = useRMs()

  // Local state for modal visibility
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Load RMs on mount
  useEffect(() => {
    loadRMs()
  }, [loadRMs])

  // Handle filter changes - reload data
  const handleSearchChange = (value) => {
    updateFilters({ search: value })
  }

  const handleStatusChange = (value) => {
    updateFilters({ status: value })
    // Reload with new filters
    loadRMs({ status: value !== "all" ? value : undefined })
  }

  const handleClearFilters = () => {
    resetFilters()
    loadRMs()
  }

  // Success handlers - refresh the list after operations
  const handleCreateSuccess = () => {
    loadRMs()
    toast.success("RM created successfully")
  }

  const handleEditSuccess = () => {
    loadRMs()
    deselectRM()
    toast.success("RM updated successfully")
  }

  const handleDeleteSuccess = () => {
    loadRMs()
    deselectRM()
    toast.success("RM deleted successfully")
  }

  const handleAssignPartners = async (partnerIds) => {
    try {
      toast.success(`${partnerIds.length} partner(s) assigned successfully`)
      loadRMs()
    } catch (error) {
      toast.error("Failed to assign partners")
    }
  }

  // Modal handlers
  const handleViewRM = (rm) => {
    selectRM(rm)
    setDetailsModalOpen(true)
  }

  const handleEditRM = (rm) => {
    selectRM(rm)
    setEditModalOpen(true)
  }

  const handleDeleteRM = (rm) => {
    selectRM(rm)
    setDeleteModalOpen(true)
  }

  const handleAssignPartnersClick = (rm) => {
    selectRM(rm)
    setAssignModalOpen(true)
  }

  const handleCloseModal = (modalSetter) => (open) => {
    modalSetter(open)
    if (!open) deselectRM()
  }

  // Filter configuration
  const filterConfig = [
    {
      key: "status",
      value: filters.status,
      placeholder: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )

  // Use filteredRMs for display (filtered client-side from Redux state)
  const displayData = filters.search ? filteredRMs : rms

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relationship Managers"
        action="Create RM"
        onActionClick={() => setCreateModalOpen(true)}
      />

      <FilterBar
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name, email, mobile, RM code..."
        filters={filterConfig}
        onFilterChange={(key, value) => {
          if (key === "status") handleStatusChange(value)
        }}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <div className="rounded-md border p-4">
          <LoadingSkeleton />
        </div>
      ) : (
        <RMsTable
          data={displayData}
          onView={handleViewRM}
          onEdit={handleEditRM}
          onDelete={handleDeleteRM}
          onAssignPartners={handleAssignPartnersClick}
          onViewPartners={handleViewRM}
        />
      )}

      {/* Create RM Modal */}
      <CreateRMModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit RM Modal */}
      <EditRMModal
        open={editModalOpen}
        onOpenChange={handleCloseModal(setEditModalOpen)}
        rm={selectedRM}
        onSuccess={handleEditSuccess}
      />

      {/* RM Details Modal */}
      <RMDetailsModal
        open={detailsModalOpen}
        onOpenChange={handleCloseModal(setDetailsModalOpen)}
        rm={selectedRM}
      />

      {/* Assign Partners Modal */}
      <AssignPartnersModal
        open={assignModalOpen}
        onOpenChange={handleCloseModal(setAssignModalOpen)}
        rm={selectedRM}
        onSubmit={handleAssignPartners}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={handleCloseModal(setDeleteModalOpen)}
        entity={selectedRM}
        entityName="RM"
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}

export default RMsPage
