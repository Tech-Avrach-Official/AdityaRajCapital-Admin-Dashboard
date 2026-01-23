import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockPartners } from "@/lib/mockData/users"

const AssignPartnersModal = ({ open, onOpenChange, rm, onSubmit }) => {
  const [selectedPartners, setSelectedPartners] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  // Filter available partners (not assigned to any RM or assigned to this RM)
  const availablePartners = mockPartners.filter(
    (p) => !p.rmId || p.rmId === rm?.id
  )

  const filteredPartners = availablePartners.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTogglePartner = (partnerId) => {
    setSelectedPartners((prev) =>
      prev.includes(partnerId)
        ? prev.filter((id) => id !== partnerId)
        : [...prev, partnerId]
    )
  }

  const handleSubmit = () => {
    onSubmit(selectedPartners)
    setSelectedPartners([])
    setSearchTerm("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Partners to RM</DialogTitle>
          <DialogDescription>
            Select partners to assign to {rm?.name || "this RM"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-lg">
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-3">
                {filteredPartners.length > 0 ? (
                  filteredPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg"
                    >
                      <Checkbox
                        id={partner.id}
                        checked={selectedPartners.includes(partner.id)}
                        onCheckedChange={() => handleTogglePartner(partner.id)}
                      />
                      <Label
                        htmlFor={partner.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-sm text-muted-foreground">{partner.email}</p>
                        </div>
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No partners available
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {selectedPartners.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedPartners.length} partner(s) selected
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={selectedPartners.length === 0}>
            Assign Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AssignPartnersModal
