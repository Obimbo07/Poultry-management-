"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        {error.message || "Something went wrong while fetching your farm data. Please try again."}
      </p>
      <Button onClick={reset} variant="outline" className="gap-1.5">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  )
}
