"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Egg, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("admin@poultryfarm.com")
  const [password, setPassword] = useState("Admin@1234")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes("confirmed")) {
        toast.error("Please confirm your email before signing in.")
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }
    toast.success("Welcome back")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="flex min-h-screen">
      <section className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Egg className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">PoultryPro</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-balance">Sign in to your farm</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage flocks, feed, production, and finance in one place.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/registration" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Demo accounts</p>
            <p className="mt-1">Super Admin — admin@poultryfarm.com / Admin@1234</p>
            <p>Farm Manager — manager@poultryfarm.com / Manager@1234</p>
          </div>
        </div>
      </section>

      <section className="relative hidden lg:block lg:w-1/2">
        <Image src="/farm-hero.png" alt="Poultry farm at golden hour" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-primary-foreground">
          <p className="text-2xl font-bold text-balance drop-shadow">
            Run a healthier, more profitable poultry operation.
          </p>
        </div>
      </section>
    </main>
  )
}
