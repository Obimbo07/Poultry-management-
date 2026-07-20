"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id)

    if (error) {
      redirect(`/profile?error=${encodeURIComponent(error.message)}`)
    }

    redirect("/profile?updated=true")
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed"
    if (message.includes("NEXT_REDIRECT")) throw err
    redirect(`/profile?error=${encodeURIComponent(message)}`)
  }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const file = formData.get("avatar") as File
  if (!file || file.size === 0) redirect("/profile?error=No+file+selected.")

  const ext = file.name.split(".").pop() ?? "jpg"
  const filePath = `${user.id}/avatar.${ext}`

  try {
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      redirect(`/profile?error=${encodeURIComponent(uploadError.message)}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar: publicUrl })
      .eq("id", user.id)

    if (updateError) {
      redirect(`/profile?error=${encodeURIComponent(updateError.message)}`)
    }

    redirect("/profile?updated=true")
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed"
    if (message.includes("NEXT_REDIRECT")) throw err
    redirect(`/profile?error=${encodeURIComponent(message)}`)
  }
}

export async function removeAvatar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar")
      .eq("id", user.id)
      .single()

    if (profile?.avatar) {
      const path = profile.avatar.split("/").slice(-2).join("/")
      await supabase.storage.from("avatars").remove([path])
    }

    await supabase.from("profiles").update({ avatar: null }).eq("id", user.id)

    redirect("/profile?updated=true")
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Remove failed"
    if (message.includes("NEXT_REDIRECT")) throw err
    redirect(`/profile?error=${encodeURIComponent(message)}`)
  }
}
