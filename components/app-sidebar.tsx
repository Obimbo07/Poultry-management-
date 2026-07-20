"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Egg } from "lucide-react"
import { visibleGroups } from "@/lib/nav"
import { ROLE_LABELS, type Profile } from "@/lib/types"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function initials(name: string | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function AppSidebar({ profile, farmName }: { profile: Profile; farmName: string }) {
  const pathname = usePathname()
  const groups = visibleGroups(profile.role)

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Egg className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold leading-tight">Al Aqsa Poultry</span>
            <span className="truncate text-xs text-sidebar-foreground/60">{farmName}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <Link
          href="/profile"
          className="flex items-center gap-2 px-2 py-2 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar ?? undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{profile.full_name}</span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {ROLE_LABELS[profile.role]}
            </span>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
