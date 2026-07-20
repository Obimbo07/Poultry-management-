import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/auth"
import { PageHeader } from "@/components/page-header"
import { ScrollText } from "lucide-react"
import { formatDate } from "@/lib/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default async function AuditLogsPage() {
  await requireProfile()
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, profiles:user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200)

  return (
    <div>
      <PageHeader title="Audit Logs" description="Track all system activity and changes." />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden md:table-cell">Table</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!logs || logs.length === 0) ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">{formatDate(log.created_at)}</TableCell>
                  <TableCell className="text-sm">
                    {(log.profiles as Record<string, unknown>)?.full_name as string ?? "System"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{log.table_name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
