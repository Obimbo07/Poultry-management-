import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"
import { redirect } from "next/navigation"

export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) {
    return {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string) ?? user.email ?? null,
      email: user.email ?? null,
      phone: null,
      role: "staff",
      avatar: null,
      created_at: user.created_at,
    }
  }
  return profile as Profile
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getSessionProfile()
  if (!profile) redirect("/auth/login")
  return profile
}
