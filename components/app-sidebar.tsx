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
  { title: "Saved Parts", url: appRoutes.parts , svg : ` <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.16667 18.1083C9.42003 18.2546 9.70744 18.3316 10 18.3316C10.2926 18.3316 10.58 18.2546 10.8333 18.1083L16.6667 14.775C16.9198 14.6289 17.13 14.4187 17.2763 14.1657C17.4225 13.9126 17.4997 13.6256 17.5 13.3333V6.66666C17.4997 6.37438 17.4225 6.08733 17.2763 5.83429C17.13 5.58125 16.9198 5.37112 16.6667 5.22499L10.8333 1.89166C10.58 1.74538 10.2926 1.66837 10 1.66837C9.70744 1.66837 9.42003 1.74538 9.16667 1.89166L3.33333 5.22499C3.08022 5.37112 2.86998 5.58125 2.72372 5.83429C2.57745 6.08733 2.5003 6.37438 2.5 6.66666V13.3333C2.5003 13.6256 2.57745 13.9126 2.72372 14.1657C2.86998 14.4187 3.08022 14.6289 3.33333 14.775L9.16667 18.1083Z" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 18.3333V10" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.74121 5.83334L9.99954 10L17.2579 5.83334" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.25 3.55832L13.75 7.84999" stroke="#9CA3AF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
]

export function AppSidebar() {
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
          <h2 className="text-xl font-bold">AutoPartsPro</h2>
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
                    {item.svg && (
                      <span
                        dangerouslySetInnerHTML={{ __html: item.svg }}
                        className="h-5 w-5"
                      />
                    )}
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
