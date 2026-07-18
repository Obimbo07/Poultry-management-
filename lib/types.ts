export type UserRole = "super_admin" | "farm_manager" | "staff"

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: UserRole
  avatar: string | null
  created_at: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  farm_manager: "Farm Manager",
  staff: "Staff",
}
