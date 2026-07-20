import Link from "next/link"
import { Egg } from "lucide-react"
import { resetPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Egg className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Al Aqsa Poultry</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a strong password for your account.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={resetPassword} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Min 8 characters"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Confirm your password"
            />
          </div>
          <Button type="submit">Update password</Button>
        </form>

        <Link
          href="/auth/login"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Back to login
        </Link>
      </div>
    </main>
  )
}
