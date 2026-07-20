import Link from "next/link"
import { Egg, ArrowLeft } from "lucide-react"
import { forgotPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const sent = params.sent === "true"

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Egg className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Al Aqsa Poultry</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {sent
            ? "Check your email for a link to reset your password."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!sent && (
          <form action={forgotPassword} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@poultryfarm.com"
              />
            </div>
            <Button type="submit">Send reset link</Button>
          </form>
        )}

        <Link
          href="/auth/login"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    </main>
  )
}
