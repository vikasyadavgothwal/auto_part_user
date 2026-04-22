import { Download } from "lucide-react"

import { OrderFilters } from "@/components/dashboard/orders/order-filters"
import { OrderStats } from "@/components/dashboard/orders/order-stats"
import {
  orderFilters,
  orders,
  orderStats,
} from "@/components/dashboard/orders/orders-data"
import { OrdersTable } from "@/components/dashboard/orders/orders-table"
import { Button } from "@/components/ui/button"

export function OrdersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            My Orders
          </h1>
          <p className="text-brand-muted">Track and manage your parts orders.</p>
        </div>

        <Button
          variant="outline"
          className="h-auto w-full gap-2 rounded-sm border-border bg-brand-panel-strong px-6 py-3 text-foreground hover:border-primary hover:bg-brand-panel-strong sm:w-auto"
        >
          <Download className="h-5 w-5" />
          Export Orders
        </Button>
      </div>

      <OrderStats stats={orderStats} />
      <OrderFilters filters={orderFilters} />
      <OrdersTable orders={orders} />
    </div>
  )
}
