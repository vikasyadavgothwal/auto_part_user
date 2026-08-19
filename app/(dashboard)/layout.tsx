import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/app-header"
import { SessionKeepalive } from "@/components/auth/session-keepalive"
import { requireDashboardUser } from "@/lib/auth/server"
import { getSiteBranding } from "@/lib/site-branding"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [user, branding] = await Promise.all([requireDashboardUser("User"), getSiteBranding()])

  return (
    <SidebarProvider>
      <SessionKeepalive />
      <AppSidebar branding={branding} />
      <SidebarInset className="min-h-svh min-w-0 bg-brand-surface">
        <DashboardHeader user={user} />
        <div className="flex min-w-0 flex-1 flex-col p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
