import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/auth"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ROLE_LABELS, type UserRole } from "@/lib/types"
import { Users } from "lucide-react"

function initials(name: string | null) {
  if (!name) return "U"
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

export default async function UsersPage() {
  await requireProfile()
  const supabase = await createClient()

  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at")

  return (
    <div>
      <PageHeader title="Users" description="Manage user accounts and roles." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(profiles ?? []).map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center gap-4 p-5">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {initials(p.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.full_name ?? "Unnamed"}</p>
                <p className="truncate text-sm text-muted-foreground">{p.email}</p>
                <Badge variant={p.role === "super_admin" ? "default" : p.role === "farm_manager" ? "secondary" : "outline"} className="mt-1">
                  {ROLE_LABELS[p.role as UserRole] ?? p.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!profiles || profiles.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-10 w-10 mb-3" />
            <p>No users found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
