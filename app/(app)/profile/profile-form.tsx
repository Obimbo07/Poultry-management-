"use client"

import { useState, useRef } from "react"
import { Camera, LogOut, Trash2, Save, Settings } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { updateProfile, uploadAvatar, removeAvatar } from "@/app/actions/profile"
import { ROLE_LABELS, type Profile } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"

function initials(name: string | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.full_name ?? "")
  const [phone, setPhone] = useState(profile.phone ?? "")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null!)

  async function handleSave() {
    setSaving(true)
    const fd = new FormData()
    fd.set("fullName", name)
    fd.set("phone", phone)
    await updateProfile(fd)
    setSaving(false)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    setUploading(true)
    const fd = new FormData()
    fd.set("avatar", file)
    await uploadAvatar(fd)
    setUploading(false)
    setPreviewUrl(null)
    URL.revokeObjectURL(objectUrl)
  }

  async function handleRemove() {
    await removeAvatar()
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account and personal details." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-28 w-28">
                <AvatarImage src={previewUrl ?? profile.avatar ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {initials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                aria-label="Change photo"
              >
                {uploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="text-center">
              <p className="font-medium">{profile.full_name ?? "User"}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{ROLE_LABELS[profile.role]}</p>
            </div>

            {profile.avatar && (
              <Button variant="outline" size="sm" onClick={handleRemove} className="w-full">
                <Trash2 className="h-4 w-4" />
                Remove Photo
              </Button>
            )}

            <div className="flex w-full flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="w-full text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <Link
                href="/settings"
                className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Settings className="h-4 w-4" />
                Farm Settings
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={handleSave}
              className="grid gap-4"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email ?? ""} disabled className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                />
              </div>

              <Button type="submit" disabled={saving} className="w-fit">
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
