import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatusBadge from "@/components/common/StatusBadge"
import ImageViewerModal from "@/components/common/ImageViewerModal"
import { format } from "date-fns"
import { Copy, Download, Eye, FileText, User, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "react-hot-toast"

const RMDetailsModal = ({ open, onOpenChange, rm }) => {
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState({ url: "", title: "" })

  if (!rm) return null

  // Get RM code (support both old and new field names)
  const rmCode = rm.rm_code || rm.referralCode || "-"
  const phoneNumber = rm.phone_number || rm.mobile || "-"
  const partnerCount = rm.partner_count ?? rm.partnersCount ?? 0
  const totalInvestors = rm.totalInvestors ?? 0
  const createdDate = rm.created_at || rm.createdDate

  // Copy to clipboard
  const copyToClipboard = (text, label = "Value") => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  // Open image viewer
  const openImageViewer = (url, title) => {
    setSelectedImage({ url, title })
    setImageViewerOpen(true)
  }

  // Download image
  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success("Download started")
    } catch (error) {
      console.error("Download failed:", error)
      window.open(url, "_blank")
    }
  }

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "RM"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">RM Details</DialogTitle>
          </DialogHeader>

          {/* Header with Avatar and RM Code */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(rm.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{rm.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm bg-background px-2 py-1 rounded border">
                  {rmCode}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(rmCode, "RM code")}
                  title="Copy RM code"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="mt-2">
                <StatusBadge status={rm.status} />
              </div>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="partners" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Partners</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistics</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-sm font-medium">{rm.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm">{rm.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <p className="text-sm">{phoneNumber}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    RM Code
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono">{rmCode}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(rmCode, "RM code")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <StatusBadge status={rm.status} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Created Date
                  </label>
                  <p className="text-sm">
                    {createdDate
                      ? format(new Date(createdDate), "MMM dd, yyyy")
                      : "-"}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Aadhaar Front */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Aadhaar Front
                  </label>
                  {rm.aadhaar_front_image_url ? (
                    <div className="space-y-2">
                      <div className="border rounded-lg overflow-hidden bg-muted">
                        <img
                          src={rm.aadhaar_front_image_url}
                          alt="Aadhaar Front"
                          className="w-full h-40 object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openImageViewer(
                              rm.aadhaar_front_image_url,
                              "Aadhaar Front"
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Full
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadImage(
                              rm.aadhaar_front_image_url,
                              `${rm.name}_aadhaar_front.jpg`
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-8 bg-muted/50 text-center">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No document uploaded
                      </p>
                    </div>
                  )}
                </div>

                {/* PAN Card */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    PAN Card
                  </label>
                  {rm.pan_image_url ? (
                    <div className="space-y-2">
                      <div className="border rounded-lg overflow-hidden bg-muted">
                        <img
                          src={rm.pan_image_url}
                          alt="PAN Card"
                          className="w-full h-40 object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openImageViewer(
                              rm.pan_image_url,
                              "PAN Card"
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Full
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadImage(
                              rm.pan_image_url,
                              `${rm.name}_pan_card.jpg`
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-8 bg-muted/50 text-center">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No document uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Partners Tab */}
            <TabsContent value="partners" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {partnerCount > 0
                    ? `This RM has ${partnerCount} partner(s). View the Partners page for details.`
                    : "No partners assigned to this RM yet."}
                </p>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <label className="text-sm font-medium text-muted-foreground">
                    Total Partners
                  </label>
                  <p className="text-3xl font-bold text-blue-600">{partnerCount}</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <label className="text-sm font-medium text-muted-foreground">
                    Total Investors
                  </label>
                  <p className="text-3xl font-bold text-green-600">{totalInvestors}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={selectedImage.url}
        title={selectedImage.title}
      />
    </>
  )
}

export default RMDetailsModal
