import { Calendar, FileText, Package, ShoppingCart } from "lucide-react"

import { ActiveRfqsSection } from "@/components/dashboard/overview/active-rfqs-section"
import { OverviewStats } from "@/components/dashboard/overview/overview-stats"
import { PrimaryVehicleCard } from "@/components/dashboard/overview/primary-vehicle-card"
import { RecentOrdersSection } from "@/components/dashboard/overview/recent-orders-section"
import { RecommendedProductsSection } from "@/components/dashboard/overview/recommended-products-section"
import { getUserOverviewData } from "@/lib/overview.server"

export async function OverviewPage() {
  const overview = await getUserOverviewData()
  const overviewStats = [
    {
      title: "Active Orders",
      value: String(overview.summary.activeOrders),
      subtext: `${overview.summary.inTransitOrders} in transit`,
      icon: ShoppingCart,
    },
    {
      title: "Active RFQs",
      value: String(overview.summary.activeRfqs),
      subtext: `${overview.summary.quotesReceived} quotes received`,
      icon: FileText,
    },
    {
      title: "Service Bookings",
      value: String(overview.summary.upcomingBookings),
      subtext: overview.summary.nextBooking,
      icon: Calendar,
    },
    {
      title: "Saved Parts",
      value: String(overview.summary.savedParts),
      subtext: `${overview.summary.savedPartsInStock} in stock`,
      icon: Package,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-brand-muted">
          Welcome back! Here&apos;s your activity summary.
        </p>
      </div>

      <OverviewStats stats={overviewStats} />
      <PrimaryVehicleCard
        vehicle={overview.primaryVehicle}
        vehicleCount={overview.summary.vehicles}
      />
      <RecentOrdersSection orders={overview.recentOrders} />
      <ActiveRfqsSection rfqs={overview.activeRfqs} />
      <RecommendedProductsSection
        products={overview.recommendedProducts}
        browsePartsHref={overview.browsePartsHref}
      />
    </div>
  )
}
