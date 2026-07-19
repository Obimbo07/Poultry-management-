"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Egg, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data?.user?.identities?.length === 0) {
        toast.error("This email is already registered")
        setLoading(false)
        return
      }

      if (data?.session) {
        toast.success("Account created and signed in successfully!")
        window.location.href = "/dashboard"
      } else {
        toast.success("Account created! Please check your email to verify, then sign in.")
        window.location.href = "/auth/login"
      }
    } catch (err) {
      console.error("Registration failed:", err)
      toast.error("Registration failed. Please try again.")
      setLoading(false)
    }
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

          <h1 className="text-2xl font-bold tracking-tight text-balance">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start managing your poultry farm efficiently today.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="john@poultryfarm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Why sign up?</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>Track flocks and production</li>
              <li>Manage feed inventory</li>
              <li>Monitor farm finances</li>
              <li>Get AI-powered insights</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="relative hidden lg:block lg:w-1/2">
        <Image src="/farm-hero.png" alt="Poultry farm at golden hour" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-primary-foreground">
          <p className="text-2xl font-bold text-balance drop-shadow">
            Join thousands of farmers managing their operations with PoultryPro.
          </p>
        </div>
      </section>
    </main>
  )
}
