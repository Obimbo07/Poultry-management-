import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/auth"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"
import { FileBarChart } from "lucide-react"

export default async function ReportsPage() {
  await requireProfile()
  const supabase = await createClient()

  const [{ data: settings }, { data: sales }, { data: expenses }, { data: eggCollection }, { data: mortality }, { data: feedConsumption }] =
    await Promise.all([
      supabase.from("settings").select("currency").limit(1).maybeSingle(),
      supabase.from("sales").select("total, sale_date, product, sale_type"),
      supabase.from("expenses").select("amount, expense_date, category"),
      supabase.from("egg_collection").select("date, eggs_collected, broken_eggs"),
      supabase.from("mortality").select("date, dead_birds, reason"),
      supabase.from("feed_consumption").select("date, quantity_used"),
    ])

  const c = settings?.currency ?? "USD"
  const totalRevenue = (sales ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0)
  const totalExpenses = (expenses ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0)
  const totalEggs = (eggCollection ?? []).reduce((s, r) => s + (r.eggs_collected ?? 0), 0)
  const totalMortality = (mortality ?? []).reduce((s, r) => s + (r.dead_birds ?? 0), 0)
  const totalFeedUsed = (feedConsumption ?? []).reduce((s, r) => s + Number(r.quantity_used ?? 0), 0)

  const expensesByCategory = new Map<string, number>()
  for (const e of expenses ?? []) {
    const cat = e.category ?? "Other"
    expensesByCategory.set(cat, (expensesByCategory.get(cat) ?? 0) + Number(e.amount ?? 0))
  }

  const salesByType = new Map<string, number>()
  for (const s of sales ?? []) {
    const t = s.sale_type ?? "Other"
    salesByType.set(t, (salesByType.get(t) ?? 0) + Number(s.total ?? 0))
  }

  const mortalityByReason = new Map<string, number>()
  for (const m of mortality ?? []) {
    const r = m.reason ?? "Unknown"
    mortalityByReason.set(r, (mortalityByReason.get(r) ?? 0) + (m.dead_birds ?? 0))
  }

  return (
    <div>
      <PageHeader title="Reports" description="Summary reports and breakdowns." />

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Total Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalRevenue, c)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Total Expenses</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalExpenses, c)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Net Profit</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? "text-primary" : "text-destructive"}`}>
              {formatCurrency(totalRevenue - totalExpenses, c)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Production Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Total Eggs Collected</span><Badge variant="secondary">{totalEggs.toLocaleString()}</Badge></div>
            <div className="flex justify-between"><span>Total Mortality</span><Badge variant="destructive">{totalMortality.toLocaleString()}</Badge></div>
            <div className="flex justify-between"><span>Total Feed Used</span><Badge variant="secondary">{totalFeedUsed.toLocaleString()} kg</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Expenses by Category</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[...expensesByCategory.entries()].sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between">
                <span>{cat}</span>
                <Badge variant="outline">{formatCurrency(amt, c)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Sales by Type</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[...salesByType.entries()].sort((a, b) => b[1] - a[1]).map(([type, amt]) => (
              <div key={type} className="flex justify-between">
                <span>{type}</span>
                <Badge variant="outline">{formatCurrency(amt, c)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Mortality by Cause</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[...mortalityByReason.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
              <div key={reason} className="flex justify-between">
                <span>{reason}</span>
                <Badge variant="destructive">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
