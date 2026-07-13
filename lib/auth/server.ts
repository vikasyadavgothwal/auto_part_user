import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { requestBackend } from "@/lib/auth/backend"
import type { AuthApiPayload, DashboardRole, DashboardUser } from "@/lib/auth/types"
import { appRoutes } from "@/lib/routes"

export async function requireDashboardUser(
  requiredRole: DashboardRole,
): Promise<DashboardUser> {
  const cookieHeader = (await cookies()).toString()
  const response = await requestBackend("/api/v1/user/auth/me", {
    cookieHeader,
  })

  if (response.status === 401) {
    redirect("/api/auth/refresh")
  }

  if (!response.ok) {
    redirect(appRoutes.login)
  }

  const payload = (await response.json()) as AuthApiPayload
  if (!payload.ok || !payload.user.roles.includes(requiredRole)) {
    redirect(`${appRoutes.login}?error=role`)
  }

  return payload.user
}
