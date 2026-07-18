import type React from "react"
import { requireProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile()
  const supabase = await createClient()

  const [{ data: settings }, { count: unread }] = await Promise.all([
    supabase.from("settings").select("farm_name").limit(1).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
  ])

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} farmName={settings?.farm_name ?? "Poultry Farm"} />
      <SidebarInset>
        <AppTopbar profile={profile} unread={unread ?? 0} />
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
