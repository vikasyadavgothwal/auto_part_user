import { ExportOrdersButton } from "@/components/dashboard/orders/export-orders-button";
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
  page?: number;
};

const ordersPageSize = 10;

const normalizedPage = (page: number | undefined) =>
  Number.isFinite(page) && page && page > 0 ? Math.floor(page) : 1;

const pageHref = (status: string, page: number) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/orders?${query}` : "/orders";
};

export async function OrdersPage({ status = "", page = 1 }: OrdersPageProps) {
  const currentPage = normalizedPage(page);
  const ordersData = await getUserOrders({
    status,
    page: currentPage,
    pageSize: ordersPageSize,
  });
  const orders = mapUserOrders(ordersData.orders);
  const orderStats = buildUserOrderStats(ordersData.summary);
  const pagination = ordersData.pagination;
  const rangeStart = pagination.total
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 0;
  const rangeEnd = Math.min(pagination.page * pagination.pageSize, pagination.total);
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

        <ExportOrdersButton />
      </div>

      <OrderStats stats={orderStats} />
      <OrderFilters filters={filters} />
      <p className="text-sm text-brand-muted">
        Showing {rangeStart}-{rangeEnd} of {pagination.total} orders.
      </p>
      <OrdersTable orders={orders} />
      <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            asChild={pagination.page > 1}
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
          >
            {pagination.page > 1 ? (
              <a href={pageHref(status, pagination.page - 1)}>Previous</a>
            ) : (
              <span>Previous</span>
            )}
          </Button>
          <Button
            asChild={pagination.page < pagination.totalPages}
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
          >
            {pagination.page < pagination.totalPages ? (
              <a href={pageHref(status, pagination.page + 1)}>Next</a>
            ) : (
              <span>Next</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
