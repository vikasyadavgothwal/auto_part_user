import { OrdersPage } from "@/components/dashboard/orders/orders-page";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  return (
    <OrdersPage
      status={params.status ?? ""}
      page={Number.parseInt(params.page ?? "1", 10)}
    />
  );
}
