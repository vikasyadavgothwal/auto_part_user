export type DashboardRole = "Fleet" | "User" | "Garage" | "Supplier"

export type DashboardUser = {
  id: string
  email: string | null
  phone: string | null
  firstName: string | null
  lastName: string | null
  companyName: string | null
  avatarUrl: string | null
  roles: DashboardRole[]
  activeRole: DashboardRole
}

export type AuthApiPayload =
  | {
      ok: true
      success: true
      user: DashboardUser
      expiresAt?: string
    }
  | {
      ok: false
      success: false
      message: string
    }

export function getDashboardUserName(user: DashboardUser): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.companyName ||
    user.email ||
    "User account"
  )
}
