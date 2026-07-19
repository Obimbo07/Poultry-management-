"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { requireProfile } from "@/lib/auth"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage farm settings and preferences." />
      <SettingsForm />
    </div>
  )
}

function SettingsForm() {
  const [farmName, setFarmName] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle()
    if (data) {
      setFarmName(data.farm_name ?? "")
      setCurrency(data.currency ?? "USD")
    }
  }

  // Load on mount
  if (!farmName && !saved) {
    load()
  }

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    const { data: existing } = await supabase.from("settings").select("id").limit(1).maybeSingle()
    if (existing) {
      await supabase.from("settings").update({ farm_name: farmName, currency }).eq("id", existing.id)
    } else {
      await supabase.from("settings").insert({ farm_name: farmName, currency })
    }
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Farm Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="farm_name">Farm Name</Label>
            <Input
              id="farm_name"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="My Poultry Farm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={3}
            />
            <p className="text-xs text-muted-foreground">3-letter ISO currency code (e.g. USD, ZMW, KES)</p>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-fit">
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : loading ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>App Version: 1.0.0</p>
          <p>Framework: Next.js 16 + React 19</p>
          <p>Database: Supabase (PostgreSQL)</p>
          <p>UI: shadcn/ui + Tailwind CSS 4</p>
        </CardContent>
      </Card>
    </div>
  )
}
