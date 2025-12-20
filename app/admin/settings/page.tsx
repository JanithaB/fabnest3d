"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [storeName, setStoreName] = useState("Fabnest3D")
  const [storeEmail, setStoreEmail] = useState("contact@fabnest3d.com")
  const [storeDescription, setStoreDescription] = useState("Professional 3D printing services for all your needs")
  const [orderNotifications, setOrderNotifications] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Settings saved",
      description: "General settings have been updated successfully.",
    })
  }

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Preferences saved",
      description: "System preferences have been updated.",
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-muted-foreground">Configure your store settings</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your store information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Contact Email</Label>
                <Input
                  id="store-email"
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Store Description</Label>
                <Textarea
                  id="store-description"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>Configure system behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-notifications">Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for new orders</p>
                </div>
                <Switch id="order-notifications" checked={orderNotifications} onCheckedChange={setOrderNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable the store</p>
                </div>
                <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Configuration</CardTitle>
            <CardDescription>Manage material pricing and calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pla-price">PLA Price ($/g)</Label>
                <Input id="pla-price" type="number" step="0.01" defaultValue="0.03" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="abs-price">ABS Price ($/g)</Label>
                <Input id="abs-price" type="number" step="0.01" defaultValue="0.04" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petg-price">PETG Price ($/g)</Label>
                <Input id="petg-price" type="number" step="0.01" defaultValue="0.05" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpu-price">TPU Price ($/g)</Label>
                <Input id="tpu-price" type="number" step="0.01" defaultValue="0.06" />
              </div>
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Update Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
