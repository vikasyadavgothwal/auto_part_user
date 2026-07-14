import { Download } from "lucide-react";

import { OrderFilters } from "@/components/dashboard/orders/order-filters";
import { OrderStats } from "@/components/dashboard/orders/order-stats";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { Button } from "@/components/ui/button";
import {
  buildUserOrderStats,
  getUserOrders,
  mapUserOrders,
} from "@/lib/orders.server";

const filterConfig = [
  { label: "All Orders", status: "" },
  { label: "Processing", status: "processing" },
  { label: "Confirmed", status: "confirmed" },
  { label: "Shipped", status: "shipped" },
  { label: "Delivered", status: "delivered" },
];

type OrdersPageProps = {
  status?: string;
};

export async function OrdersPage({ status = "" }: OrdersPageProps) {
  const ordersData = await getUserOrders({ status });
  const orders = mapUserOrders(ordersData.orders);
  const orderStats = buildUserOrderStats(ordersData.summary);
  const filters = filterConfig.map((filter) => ({
    label: filter.label,
    active: filter.status === status,
    href: filter.status ? `/orders?status=${filter.status}` : "/orders",
  }));

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-brand-muted">
            Track and manage your parts orders.
          </p>
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
      <OrderFilters filters={filters} />
      <p className="text-sm text-brand-muted">
        Showing {orders.length} of {ordersData.pagination.total} orders.
      </p>
      <OrdersTable orders={orders} />
    </div>
  );
}
