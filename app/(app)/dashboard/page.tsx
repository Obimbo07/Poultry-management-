import Link from "next/link"
import {
  Bird,
  Egg,
  Wheat,
  Skull,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  ShoppingCart,
  Syringe,
} from "lucide-react"
import { requireProfile } from "@/lib/auth"
import { getDashboardData } from "@/lib/dashboard-data"
import { formatCurrency, formatNumber, formatDate } from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  EggProductionChart,
  MortalityChart,
  RevenueChart,
  FeedChart,
} from "@/components/dashboard-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const profile = await requireProfile()
  const d = await getDashboardData()
  const c = d.currency

  const quickActions = [
    { label: "Record Egg Collection", href: "/egg-production", icon: Egg },
    { label: "New Sale", href: "/sales", icon: ShoppingCart },
    { label: "Log Mortality", href: "/mortality", icon: Skull },
    { label: "Add Bird Batch", href: "/bird-batches", icon: Bird },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${profile.full_name?.split(" ")[0] ?? "there"}`}
        description="Here's what's happening on your farm today."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Total Birds" value={formatNumber(d.kpis.totalBirds)} icon={Bird} />
        <StatCard label="Eggs Today" value={formatNumber(d.kpis.totalEggsToday)} icon={Egg} />
        <StatCard
          label="Feed Remaining"
          value={`${formatNumber(d.kpis.totalFeed)} kg`}
          icon={Wheat}
          tone={d.kpis.lowFeedCount > 0 ? "warning" : "default"}
          hint={d.kpis.lowFeedCount > 0 ? `${d.kpis.lowFeedCount} item(s) low` : undefined}
        />
        <StatCard label="Mortality Today" value={formatNumber(d.kpis.mortalityCount)} icon={Skull} tone="negative" />
        <StatCard label="Total Revenue" value={formatCurrency(d.kpis.totalRevenue, c)} icon={DollarSign} tone="positive" />
        <StatCard label="Total Expenses" value={formatCurrency(d.kpis.totalExpenses, c)} icon={TrendingDown} />
        <StatCard
          label="Profit"
          value={formatCurrency(d.kpis.profit, c)}
          icon={TrendingUp}
          tone={d.kpis.profit >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Active Employees" value={formatNumber(d.kpis.activeEmployees)} icon={Users} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <EggProductionChart data={d.eggChart} />
        <RevenueChart data={d.revenueChart} />
        <MortalityChart data={d.mortalityChart} />
        <FeedChart data={d.feedChart} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickActions.map((a) => (
              <Link key={a.href} href={a.href} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted hover:text-foreground justify-start">
                  <a.icon className="h-4 w-4" />
                  {a.label}
                  <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {d.recentSales.length === 0 && (
              <p className="text-sm text-muted-foreground">No sales recorded yet.</p>
            )}
            {d.recentSales.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.product ?? "Sale"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.sale_date)}</p>
                </div>
                <span className="font-semibold">{formatCurrency(Number(s.total), c)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Syringe className="h-4 w-4" /> Upcoming Vaccinations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {d.upcomingVax.length === 0 && (
              <p className="text-sm text-muted-foreground">No scheduled vaccinations.</p>
            )}
            {d.upcomingVax.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{v.vaccine_name}</span>
                <Badge variant="secondary">{formatDate(v.next_due_date)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
