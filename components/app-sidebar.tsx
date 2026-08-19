"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  Truck,
  FileText,
  ShoppingCart,
  ShoppingBag,
  Settings,
  Package,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { appRoutes, stripBasePath } from "@/lib/routes"

const items = [
  { title: "Overview", url: appRoutes.overview, icon: House },
  { title: "My Vehicles", url: appRoutes.vehicles, icon: Truck },
  { title: "RFQs", url: appRoutes.rfqs, icon: FileText },
  { title: "Orders", url: appRoutes.orders, icon: ShoppingCart },
  { title: "Bookings", url: appRoutes.bookings, icon: ShoppingBag },
  { title: "Saved Parts", url: appRoutes.parts, icon: Package },
]

export function AppSidebar({ branding }: { branding?: { siteName: string; logoUrl: string } }) {
  const currentPath = stripBasePath(usePathname())
  const { isMobile, setOpenMobile } = useSidebar()

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar className="border-sidebar-border bg-brand-panel text-foreground">
      <SidebarHeader className="border-b border-border px-6 py-6">
        <Link
          href={appRoutes.overview}
          className="block"
          onClick={closeMobileSidebar}
        >
          {branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt={branding.siteName} className="h-10 max-w-[190px] object-contain object-left" />
          ) : <h2 className="text-xl font-bold">{branding?.siteName === "AutoPartsPro" || branding?.siteName === "AutoParts Pro" || !branding?.siteName ? <>AutoParts<span className="text-primary"> Pro</span></> : branding.siteName}</h2>}
          <p className="mt-1 text-sm text-muted-foreground">
            Buyer 
          </p>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto px-4 py-4">
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon

            const isActive =
              item.url === appRoutes.overview
                ? currentPath === appRoutes.overview ||
                  currentPath === appRoutes.legacyOverview
                : currentPath === item.url ||
                  currentPath.startsWith(`${item.url}/`)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`h-auto rounded-sm px-4 py-3 transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-3"
                    onClick={closeMobileSidebar}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={
                currentPath === appRoutes.settings ||
                currentPath.startsWith(`${appRoutes.settings}/`)
              }
              className={`h-auto rounded-sm px-4 py-3 transition-all ${
                currentPath === appRoutes.settings ||
                currentPath.startsWith(`${appRoutes.settings}/`)
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Link
                href={appRoutes.settings}
                className="flex items-center gap-3"
                onClick={closeMobileSidebar}
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
