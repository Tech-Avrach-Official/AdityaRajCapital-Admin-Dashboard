import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import apiClient from "@/lib/api/apiClient"
import { endpoints } from "@/lib/api/endpoints"
import { handleApiError } from "@/lib/utils/errorHandler"

const TDS_MIN = 0
const TDS_MAX = 100

const formatTdsRate = (val) => {
  if (val === "" || val == null) return "—"
  const n = Number(val)
  return Number.isNaN(n) ? "—" : `${n}%`
}

const SettingsPage = () => {
  const [tdsSettings, setTdsSettings] = useState({
    tds_percent_investor: "",
    tds_percent_partner: "",
    tds_percent_rm: "",
  })
  const [tdsLoading, setTdsLoading] = useState(false)
  const [tdsSaving, setTdsSaving] = useState(false)
  const [tdsError, setTdsError] = useState(null)

  const fetchTdsSettings = async () => {
    setTdsLoading(true)
    setTdsError(null)
    try {
      const response = await apiClient.get(endpoints.settings.tds)
      if (response.data?.success && response.data?.data) {
        const d = response.data.data
        setTdsSettings({
          tds_percent_investor: d.tds_percent_investor ?? "",
          tds_percent_partner: d.tds_percent_partner ?? "",
          tds_percent_rm: d.tds_percent_rm ?? "",
        })
      }
    } catch (error) {
      setTdsError(error?.response?.data?.message || error?.message || "Failed to load TDS settings")
      handleApiError(error, "Failed to load TDS settings")
    } finally {
      setTdsLoading(false)
    }
  }

  useEffect(() => {
    fetchTdsSettings()
  }, [])

  const handleTdsChange = (field, value) => {
    setTdsError(null)
    const num = value === "" ? "" : Number(value)
    if (value !== "" && (num < TDS_MIN || num > TDS_MAX)) return
    setTdsSettings((prev) => ({ ...prev, [field]: value === "" ? "" : num }))
  }

  const getTdsNum = (val) => (val === "" ? "" : Number(val))

  const handleTdsSubmit = async (e) => {
    e.preventDefault()
    setTdsError(null)
    const investor = getTdsNum(tdsSettings.tds_percent_investor)
    const partner = getTdsNum(tdsSettings.tds_percent_partner)
    const rm = getTdsNum(tdsSettings.tds_percent_rm)
    if (investor === "" && partner === "" && rm === "") {
      setTdsError("At least one TDS field must be provided.")
      return
    }
    const payload = {}
    if (investor !== "") payload.tds_percent_investor = investor
    if (partner !== "") payload.tds_percent_partner = partner
    if (rm !== "") payload.tds_percent_rm = rm
    setTdsSaving(true)
    try {
      const response = await apiClient.put(endpoints.settings.tds, payload)
      if (response.data?.success && response.data?.data) {
        const d = response.data.data
        setTdsSettings({
          tds_percent_investor: d.tds_percent_investor ?? "",
          tds_percent_partner: d.tds_percent_partner ?? "",
          tds_percent_rm: d.tds_percent_rm ?? "",
        })
        toast.success("TDS settings updated successfully")
      } else {
        toast.error(response.data?.message || "Failed to update TDS settings")
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message
      setTdsError(msg || "Failed to update TDS settings")
      handleApiError(error, "Failed to update TDS settings")
    } finally {
      setTdsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="System Configuration" />

      <Tabs defaultValue="payout" className="w-full">
        <TabsList>
          <TabsTrigger value="payout">Payout Settings</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="tds">TDS Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="payout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Phase Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((phase) => (
                  <Card key={phase}>
                    <CardHeader>
                      <CardTitle>Phase {phase}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label>Investment Date Range</Label>
                        <p className="text-sm text-muted-foreground">
                          {phase === 1 && "1-10"}
                          {phase === 2 && "11-20"}
                          {phase === 3 && "21-30"}
                        </p>
                      </div>
                      <div>
                        <Label>Payout Window</Label>
                        <p className="text-sm text-muted-foreground">
                          {phase === 1 && "11-20 (same/next month)"}
                          {phase === 2 && "21-30 (same/next month)"}
                          {phase === 3 && "1-10 (next month)"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input id="platformName" defaultValue="AdityaRaj Capital" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue="support@adityarajcapital.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input id="supportPhone" defaultValue="+91 1234567890" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance">Maintenance Mode</Label>
                <Switch id="maintenance" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="30" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="2fa">2FA Required</Label>
                <Switch id="2fa" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TDS (Tax Deducted at Source)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Set the TDS percentage for investor payouts, partner commission, and RM commission (0–100%). Receivable = Total − (Total × TDS% ÷ 100).
              </p>
            </CardHeader>
            <CardContent>
              {tdsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="mb-6 rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Current TDS rates</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Investor payout:</span>{" "}
                        <span className="font-medium">{formatTdsRate(tdsSettings.tds_percent_investor)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Partner commission:</span>{" "}
                        <span className="font-medium">{formatTdsRate(tdsSettings.tds_percent_partner)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RM commission:</span>{" "}
                        <span className="font-medium">{formatTdsRate(tdsSettings.tds_percent_rm)}</span>
                      </div>
                    </div>
                  </div>
                  <form onSubmit={handleTdsSubmit} className="space-y-4">
                    {tdsError && (
                      <p className="text-sm text-destructive font-medium" role="alert">
                        {tdsError}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tds_investor">Investor payout TDS (%)</Label>
                      <Input
                        id="tds_investor"
                        type="number"
                        min={TDS_MIN}
                        max={TDS_MAX}
                        step={0.01}
                        placeholder="0–100"
                        value={tdsSettings.tds_percent_investor}
                        onChange={(e) => handleTdsChange("tds_percent_investor", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Applied to investor payouts</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tds_partner">Partner commission TDS (%)</Label>
                      <Input
                        id="tds_partner"
                        type="number"
                        min={TDS_MIN}
                        max={TDS_MAX}
                        step={0.01}
                        placeholder="0–100"
                        value={tdsSettings.tds_percent_partner}
                        onChange={(e) => handleTdsChange("tds_percent_partner", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Applied to partner commission</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tds_rm">RM commission TDS (%)</Label>
                      <Input
                        id="tds_rm"
                        type="number"
                        min={TDS_MIN}
                        max={TDS_MAX}
                        step={0.01}
                        placeholder="0–100"
                        value={tdsSettings.tds_percent_rm}
                        onChange={(e) => handleTdsChange("tds_percent_rm", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Applied to RM commission</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={tdsSaving}>
                      {tdsSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        "Save TDS Settings"
                      )}
                    </Button>
                  </div>
                </form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Template management will be implemented here. (Upload, edit, preview templates)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage
