import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatusBadge from "@/components/common/StatusBadge"
import { format } from "date-fns"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

const RMDetailsModal = ({ open, onOpenChange, rm }) => {
  if (!rm) return null

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RM Details</DialogTitle>
          <DialogDescription>View relationship manager information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info">Basic Information</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm font-medium">{rm.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{rm.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                <p className="text-sm">{rm.mobile}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Referral Code</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono">{rm.referralCode}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(rm.referralCode)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <StatusBadge status={rm.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="text-sm">
                  {format(new Date(rm.createdDate), "MMM dd, yyyy")}
                </p>
              </div>
              {rm.lastLogin && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                  <p className="text-sm">
                    {format(new Date(rm.lastLogin), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="partners">
            <p className="text-sm text-muted-foreground">
              Partners list will be displayed here. (To be implemented with partner data)
            </p>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">Total Partners</label>
                <p className="text-2xl font-bold">{rm.partnersCount}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">
                  Total Investors
                </label>
                <p className="text-2xl font-bold">{rm.totalInvestors}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default RMDetailsModal
