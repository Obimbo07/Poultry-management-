import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  tone?: "default" | "positive" | "negative" | "warning"
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary",
    positive: "bg-primary/10 text-primary",
    negative: "bg-destructive/10 text-destructive",
    warning: "bg-accent/20 text-accent-foreground",
  }[tone]

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-bold tracking-tight">{value}</p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
