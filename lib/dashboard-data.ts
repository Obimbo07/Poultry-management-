import { createClient } from "@/lib/supabase/server"

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function shortDay(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function monthKey(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

export type KpiData = {
  totalBirds: number
  totalEggsToday: number
  totalFeed: number
  mortalityCount: number
  totalRevenue: number
  totalExpenses: number
  profit: number
  activeEmployees: number
  lowFeedCount: number
}

export type ChartPoint = { label: string; eggs: number; broken: number }
export type MortalityPoint = { label: string; deaths: number }
export type RevenuePoint = { label: string; revenue: number; expenses: number }
export type FeedPoint = { label: string; feed: number }

export type DashboardData = {
  currency: string
  kpis: KpiData
  eggChart: ChartPoint[]
  mortalityChart: MortalityPoint[]
  revenueChart: RevenuePoint[]
  feedChart: FeedPoint[]
  recentSales: {
    id: string
    product: string | null
    total: number | null
    sale_date: string | null
    payment_method: string | null
  }[]
  upcomingVax: {
    id: string
    vaccine_name: string | null
    next_due_date: string | null
  }[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const today = dayKey(new Date())

  try {
    const [
      inventory,
      feed,
      eggsToday,
      mortalityToday,
      sales,
      expenses,
      employees,
      eggSeries,
      mortalitySeries,
      feedSeries,
      recentSales,
      upcomingVax,
      settings,
    ] = await Promise.all([
      supabase.from("bird_inventory").select("current_quantity"),
      supabase.from("feed_inventory").select("quantity, reorder_level, feed_name"),
      supabase.from("egg_collection").select("eggs_collected").eq("date", today),
      supabase.from("mortality").select("dead_birds").eq("date", today),
      supabase.from("sales").select("total, sale_date"),
      supabase.from("expenses").select("amount, expense_date"),
      supabase.from("employees").select("id").eq("status", "active"),
      supabase.from("egg_collection").select("date, eggs_collected, broken_eggs").order("date"),
      supabase.from("mortality").select("date, dead_birds").order("date"),
      supabase.from("feed_consumption").select("date, quantity_used").order("date"),
      supabase
        .from("sales")
        .select("id, product, total, sale_date, payment_method")
        .order("sale_date", { ascending: false })
        .limit(6),
      supabase
        .from("vaccination")
        .select("id, vaccine_name, next_due_date")
        .order("next_due_date")
        .limit(5),
      supabase.from("settings").select("currency").limit(1).maybeSingle(),
    ])

    const totalBirds = (inventory.data ?? []).reduce((s, r) => s + (r.current_quantity ?? 0), 0)
    const totalEggsToday = (eggsToday.data ?? []).reduce((s, r) => s + (r.eggs_collected ?? 0), 0)
    const totalFeed = (feed.data ?? []).reduce((s, r) => s + Number(r.quantity ?? 0), 0)
    const lowFeed = (feed.data ?? []).filter(
      (r) => Number(r.quantity ?? 0) <= Number(r.reorder_level ?? 0),
    )
    const mortalityCount = (mortalityToday.data ?? []).reduce((s, r) => s + (r.dead_birds ?? 0), 0)
    const totalRevenue = (sales.data ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0)
    const totalExpenses = (expenses.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0)
    const activeEmployees = (employees.data ?? []).length

    const eggMap = new Map<string, { eggs: number; broken: number }>()
    for (const r of eggSeries.data ?? []) {
      const cur = eggMap.get(r.date) ?? { eggs: 0, broken: 0 }
      cur.eggs += r.eggs_collected ?? 0
      cur.broken += r.broken_eggs ?? 0
      eggMap.set(r.date, cur)
    }
    const eggChart = [...eggMap.entries()]
      .slice(-14)
      .map(([date, v]) => ({ label: shortDay(date), eggs: v.eggs, broken: v.broken }))

    const mortMap = new Map<string, number>()
    for (const r of mortalitySeries.data ?? []) {
      mortMap.set(r.date, (mortMap.get(r.date) ?? 0) + (r.dead_birds ?? 0))
    }
    const mortalityChart = [...mortMap.entries()]
      .slice(-14)
      .map(([date, deaths]) => ({ label: shortDay(date), deaths }))

    const feedMap = new Map<string, number>()
    for (const r of feedSeries.data ?? []) {
      feedMap.set(r.date, (feedMap.get(r.date) ?? 0) + Number(r.quantity_used ?? 0))
    }
    const feedChart = [...feedMap.entries()]
      .slice(-14)
      .map(([date, feed]) => ({ label: shortDay(date), feed: Math.round(feed) }))

    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      months.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)))
    }
    const revByMonth = new Map<string, number>()
    const expByMonth = new Map<string, number>()
    for (const r of sales.data ?? []) {
      const k = monthKey(new Date(r.sale_date))
      revByMonth.set(k, (revByMonth.get(k) ?? 0) + Number(r.total ?? 0))
    }
    for (const r of expenses.data ?? []) {
      const k = monthKey(new Date(r.expense_date))
      expByMonth.set(k, (expByMonth.get(k) ?? 0) + Number(r.amount ?? 0))
    }
    const revenueChart = months.map((m) => ({
      label: m,
      revenue: Math.round(revByMonth.get(m) ?? 0),
      expenses: Math.round(expByMonth.get(m) ?? 0),
    }))

    return {
      currency: settings?.currency ?? "USD",
      kpis: {
        totalBirds,
        totalEggsToday,
        totalFeed,
        mortalityCount,
        totalRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
        activeEmployees,
        lowFeedCount: lowFeed.length,
      },
      eggChart,
      mortalityChart,
      feedChart,
      revenueChart,
      recentSales: recentSales.data ?? [],
      upcomingVax: upcomingVax.data ?? [],
    }
  } catch {
    return {
      currency: "USD",
      kpis: {
        totalBirds: 0,
        totalEggsToday: 0,
        totalFeed: 0,
        mortalityCount: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0,
        activeEmployees: 0,
        lowFeedCount: 0,
      },
      eggChart: [],
      mortalityChart: [],
      feedChart: [],
      revenueChart: [],
      recentSales: [],
      upcomingVax: [],
    }
  }
}
