"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

function getOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    redirect("/auth/login?error=Email+and+password+are+required.")
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes("confirmed")) {
      redirect("/auth/login?error=Please+confirm+your+email+before+signing+in.")
    }
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/dashboard")
}

export async function registerUser(formData: FormData) {
  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password || !fullName) {
    redirect("/auth/registration?error=All+fields+are+required.")
  }

  if (password !== confirmPassword) {
    redirect("/auth/registration?error=Passwords+do+not+match.")
  }

  if (password.length < 8) {
    redirect("/auth/registration?error=Password+must+be+at+least+8+characters.")
  }

  const supabase = await createClient()

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
    redirect(`/auth/registration?error=${encodeURIComponent(error.message)}`)
  }

  if (data?.user?.identities?.length === 0) {
    redirect("/auth/registration?error=This+email+is+already+registered.")
  }

  if (data?.session) {
    redirect("/dashboard")
  } else {
    redirect("/auth/login?message=Account+created!+Please+check+your+email+to+verify.")
  }
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    redirect("/auth/forgot-password?error=Email+is+required.")
  }

  const supabase = await createClient()
  const origin = getOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/auth/forgot-password?sent=true")
}

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password) {
    redirect("/auth/reset-password?error=Password+is+required.")
  }

  if (password !== confirmPassword) {
    redirect("/auth/reset-password?error=Passwords+do+not+match.")
  }

  if (password.length < 8) {
    redirect("/auth/reset-password?error=Password+must+be+at+least+8+characters.")
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/auth/login?message=Password+updated!+Please+sign+in.")
}
