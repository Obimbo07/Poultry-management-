import type { UserRole } from "@/lib/types"
import {
  LayoutDashboard,
  Bird,
  Wheat,
  Utensils,
  Egg,
  Skull,
  Syringe,
  Pill,
  Users,
  ShoppingCart,
  Receipt,
  Truck,
  UserCog,
  FileBarChart,
  Bell,
  Settings,
  ScrollText,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

const ALL: UserRole[] = ["super_admin", "farm_manager", "staff"]
const MGR: UserRole[] = ["super_admin", "farm_manager"]
const ADMIN: UserRole[] = ["super_admin"]

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL },
      { label: "Analytics", href: "/analytics", icon: FileBarChart, roles: MGR },
    ],
  },
  {
    label: "Flock Operations",
    items: [
      { label: "Bird Batches", href: "/bird-batches", icon: Bird, roles: ALL },
      { label: "Feed Inventory", href: "/feed-inventory", icon: Wheat, roles: ALL },
      { label: "Feed Consumption", href: "/feed-consumption", icon: Utensils, roles: ALL },
      { label: "Egg Production", href: "/egg-production", icon: Egg, roles: ALL },
      { label: "Mortality", href: "/mortality", icon: Skull, roles: ALL },
      { label: "Vaccination", href: "/vaccination", icon: Syringe, roles: ALL },
      { label: "Medication", href: "/medication", icon: Pill, roles: ALL },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Sales", href: "/sales", icon: ShoppingCart, roles: ALL },
      { label: "Customers", href: "/customers", icon: Users, roles: ALL },
      { label: "Expenses", href: "/expenses", icon: Receipt, roles: MGR },
      { label: "Suppliers", href: "/suppliers", icon: Truck, roles: ALL },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Employees", href: "/employees", icon: UserCog, roles: MGR },
      { label: "Reports", href: "/reports", icon: FileBarChart, roles: MGR },
      { label: "Users", href: "/users", icon: Users, roles: ADMIN },
      { label: "Audit Logs", href: "/audit-logs", icon: ScrollText, roles: MGR },
      { label: "Notifications", href: "/notifications", icon: Bell, roles: ALL },
      { label: "Settings", href: "/settings", icon: Settings, roles: ADMIN },
    ],
  },
]

export function visibleGroups(role: UserRole): NavGroup[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(role)),
  })).filter((g) => g.items.length > 0)
}

export function canAccess(role: UserRole, href: string): boolean {
  for (const g of NAV_GROUPS) {
    for (const i of g.items) {
      if (href.startsWith(i.href)) return i.roles.includes(role)
    }
  }
  return true
}
