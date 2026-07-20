import Link from "next/link"
import { Egg, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Egg className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">PoultryPro</span>
        </div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Authentication error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while signing you in. Please try again.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    </main>
  )
}
