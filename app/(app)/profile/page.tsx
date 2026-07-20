import { getSessionProfile } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const profile = await getSessionProfile()
  if (!profile) redirect("/auth/login")
  return <ProfileForm profile={profile} />
}
