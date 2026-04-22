import { ActiveRfqsSection } from "@/components/dashboard/overview/active-rfqs-section"
import {
  activeRfqs,
  overviewStats,
  primaryVehicle,
  recentOrders,
  recommendedProducts,
} from "@/components/dashboard/overview/overview-data"
import { OverviewStats } from "@/components/dashboard/overview/overview-stats"
import { PrimaryVehicleCard } from "@/components/dashboard/overview/primary-vehicle-card"
import { RecentOrdersSection } from "@/components/dashboard/overview/recent-orders-section"
import { RecommendedProductsSection } from "@/components/dashboard/overview/recommended-products-section"

export function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-brand-muted">
          Welcome back! Here&apos;s your activity summary.
        </p>
      </div>

      <OverviewStats stats={overviewStats} />
      <PrimaryVehicleCard vehicle={primaryVehicle} />
      <RecentOrdersSection orders={recentOrders} />
      <ActiveRfqsSection rfqs={activeRfqs} />
      <RecommendedProductsSection products={recommendedProducts} />
    </div>
  )
}
