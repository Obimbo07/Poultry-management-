import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/auth"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  EggProductionChart,
  MortalityChart,
  RevenueChart,
  FeedChart,
} from "@/components/dashboard-charts"
import { formatCurrency, formatNumber } from "@/lib/format"
import { Bird, Egg, Skull, Wheat, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

export default async function AnalyticsPage() {
  await requireProfile()
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [inventory, eggs, mortality, sales, expenses, eggSeries, mortSeries, feedSeries, settings] =
    await Promise.all([
      supabase.from("bird_inventory").select("current_quantity"),
      supabase.from("egg_collection").select("eggs_collected, broken_eggs, date").order("date"),
      supabase.from("mortality").select("dead_birds, date").order("date"),
      supabase.from("sales").select("total, sale_date"),
      supabase.from("expenses").select("amount, expense_date"),
      supabase.from("egg_collection").select("date, eggs_collected, broken_eggs").order("date"),
      supabase.from("mortality").select("date, dead_birds").order("date"),
      supabase.from("feed_consumption").select("date, quantity_used").order("date"),
      supabase.from("settings").select("currency").limit(1).maybeSingle(),
    ])

  const c = settings?.currency ?? "USD"
  const totalBirds = (inventory.data ?? []).reduce((s, r) => s + (r.current_quantity ?? 0), 0)
  const totalEggs = (eggs.data ?? []).reduce((s, r) => s + (r.eggs_collected ?? 0), 0)
  const totalMortality = (mortality.data ?? []).reduce((s, r) => s + (r.dead_birds ?? 0), 0)
  const totalRevenue = (sales.data ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0)
  const totalExpenses = (expenses.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0)

  function dayKey(d: Date) { return d.toISOString().slice(0, 10) }
  function shortDay(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
  function monthKey(d: Date) { return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }) }

  const eggMap = new Map<string, { eggs: number; broken: number }>()
  for (const r of eggSeries.data ?? []) {
    const cur = eggMap.get(r.date) ?? { eggs: 0, broken: 0 }
    cur.eggs += r.eggs_collected ?? 0
    cur.broken += r.broken_eggs ?? 0
    eggMap.set(r.date, cur)
  }
  const eggChart = [...eggMap.entries()].slice(-30).map(([date, v]) => ({ label: shortDay(date), eggs: v.eggs, broken: v.broken }))

  const mortMap = new Map<string, number>()
  for (const r of mortSeries.data ?? []) mortMap.set(r.date, (mortMap.get(r.date) ?? 0) + (r.dead_birds ?? 0))
  const mortalityChart = [...mortMap.entries()].slice(-30).map(([date, deaths]) => ({ label: shortDay(date), deaths }))

  const feedMap = new Map<string, number>()
  for (const r of feedSeries.data ?? []) feedMap.set(r.date, (feedMap.get(r.date) ?? 0) + Number(r.quantity_used ?? 0))
  const feedChart = [...feedMap.entries()].slice(-30).map(([date, feed]) => ({ label: shortDay(date), feed: Math.round(feed) }))

  const months: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) months.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)))
  const revByMonth = new Map<string, number>()
  const expByMonth = new Map<string, number>()
  for (const r of sales.data ?? []) revByMonth.set(monthKey(new Date(r.sale_date)), (revByMonth.get(monthKey(new Date(r.sale_date))) ?? 0) + Number(r.total ?? 0))
  for (const r of expenses.data ?? []) expByMonth.set(monthKey(new Date(r.expense_date)), (expByMonth.get(monthKey(new Date(r.expense_date))) ?? 0) + Number(r.amount ?? 0))
  const revenueChart = months.map((m) => ({ label: m, revenue: Math.round(revByMonth.get(m) ?? 0), expenses: Math.round(expByMonth.get(m) ?? 0) }))

  return (
    <div>
      <PageHeader title="Analytics" description="Detailed farm performance analytics." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 mb-6">
        <StatCard label="Total Birds" value={formatNumber(totalBirds)} icon={Bird} />
        <StatCard label="Total Eggs (All Time)" value={formatNumber(totalEggs)} icon={Egg} />
        <StatCard label="Total Mortality" value={formatNumber(totalMortality)} icon={Skull} tone="negative" />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue, c)} icon={DollarSign} tone="positive" />
        <StatCard label="Expenses" value={formatCurrency(totalExpenses, c)} icon={TrendingDown} />
        <StatCard label="Profit" value={formatCurrency(totalRevenue - totalExpenses, c)} icon={TrendingUp} tone={totalRevenue - totalExpenses >= 0 ? "positive" : "negative"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <EggProductionChart data={eggChart} />
        <RevenueChart data={revenueChart} />
        <MortalityChart data={mortalityChart} />
        <FeedChart data={feedChart} />
      </div>
    </div>
  )
}
