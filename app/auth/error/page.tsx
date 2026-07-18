import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TriangleAlert } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Authentication error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while signing you in. Please try again.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    </main>
  )
}
