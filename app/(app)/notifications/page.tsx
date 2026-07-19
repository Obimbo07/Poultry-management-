import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/auth"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { formatDate } from "@/lib/format"

export default async function NotificationsPage() {
  await requireProfile()
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div>
      <PageHeader title="Notifications" description="System notifications and alerts." />

      <div className="space-y-3">
        {(!notifications || notifications.length === 0) ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3" />
              <p>No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex items-start gap-4 p-4">
                <Bell className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{n.title ?? "Notification"}</p>
                    {!n.read && <Badge variant="default" className="text-[10px] px-1.5">New</Badge>}
                  </div>
                  {n.message && <p className="text-sm text-muted-foreground mt-1">{n.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(n.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
