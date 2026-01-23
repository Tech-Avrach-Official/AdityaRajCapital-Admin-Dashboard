import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="System Configuration" />

      <Tabs defaultValue="payout" className="w-full">
        <TabsList>
          <TabsTrigger value="payout">Payout Settings</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
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
