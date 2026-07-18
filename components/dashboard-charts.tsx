"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--popover-foreground)",
}

function ChartFrame({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function EggProductionChart({ data }: { data: { label: string; eggs: number; broken: number }[] }) {
  return (
    <ChartFrame title="Egg Production" description="Eggs collected vs broken (14 days)">
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="eggs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="eggs" stroke="var(--chart-1)" strokeWidth={2} fill="url(#eggs)" />
        <Area type="monotone" dataKey="broken" stroke="var(--chart-4)" strokeWidth={2} fillOpacity={0} />
      </AreaChart>
    </ChartFrame>
  )
}

export function MortalityChart({ data }: { data: { label: string; deaths: number }[] }) {
  return (
    <ChartFrame title="Mortality Trend" description="Daily bird deaths (14 days)">
      <LineChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="deaths" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartFrame>
  )
}

export function RevenueChart({
  data,
}: {
  data: { label: string; revenue: number; expenses: number }[]
}) {
  return (
    <ChartFrame title="Revenue vs Expenses" description="Last 6 months">
      <BarChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartFrame>
  )
}

export function FeedChart({ data }: { data: { label: string; feed: number }[] }) {
  return (
    <ChartFrame title="Feed Consumption" description="Daily feed usage in kg (14 days)">
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="feed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="feed" stroke="var(--chart-2)" strokeWidth={2} fill="url(#feed)" />
      </AreaChart>
    </ChartFrame>
  )
}
