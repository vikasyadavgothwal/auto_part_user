import { cookies } from "next/headers";

import type { Order } from "@/components/dashboard/orders/orders-table";
import { requestBackend } from "@/lib/auth/backend";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type UserOrderRecord = {
  id: string;
  publicId: string;
  source: "rfq" | "direct";
  totalAmount: number;
  deliveryProgress: number;
  deliveredItemCount: number;
  totalItemCount: number;
  status: OrderStatus;
  paymentStatus: "pending" | "succeeded" | "failed" | "refunded";
  expectedDeliveryAt: string | null;
  proofOfDeliveryUrl: string | null;
  proofOfDeliveryNote: string | null;
  proofRecipientName: string | null;
  proofSubmittedAt: string | null;
  createdAt: string;
  deliveryRecipientName: string | null;
  deliveryPhone: string | null;
  deliveryAddressLine1: string | null;
  deliveryAddressLine2: string | null;
  deliveryLandmark: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryPostalCode: string | null;
  deliveryCountry: string | null;
  supplier: {
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  items: Array<{
    id: string;
    partName: string;
    partNumber: string | null;
    quantity: number;
    unitPrice: number | null;
    lineTotal: number | null;
    deliveryOption: string | null;
    expectedDeliveryAt: string | null;
    deliveredAt: string | null;
    proofOfDeliveryUrl: string | null;
    proofOfDeliveryNote: string | null;
    proofRecipientName: string | null;
    proofSubmittedAt: string | null;
    buyerConfirmedAt: string | null;
    review: {
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
      updatedAt: string;
    } | null;
  }>;
  rfq: {
    publicId: string;
    vehicleVin: string | null;
    vehicleYear: number | null;
    vehicleMake: string | null;
    vehicleModel: string | null;
    vehicleTrim: string | null;
  } | null;
};

type UserOrdersPayload = {
  ok: boolean;
  orders?: UserOrderRecord[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalOrders: number;
    totalAmount: number;
    byStatus: Partial<Record<OrderStatus, number>>;
  };
};

export type UserOrdersData = {
  orders: UserOrderRecord[];
  pagination: NonNullable<UserOrdersPayload["pagination"]>;
  summary: NonNullable<UserOrdersPayload["summary"]>;
};

export type UserOrderFilters = {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

const emptyOrdersData: UserOrdersData = {
  orders: [],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  },
  summary: {
    totalOrders: 0,
    totalAmount: 0,
    byStatus: {},
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatMoney = (amount: number) => `AED ${amount.toFixed(2)}`;

const statusLabel = (status: OrderStatus) =>
  status.slice(0, 1).toUpperCase() + status.slice(1);

const badgeClass = (status: OrderStatus) => {
  if (status === "delivered") {
    return "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10";
  }
  if (status === "shipped") {
    return "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10";
  }
  if (status === "cancelled") {
    return "border-primary/20 bg-primary/10 text-primary hover:bg-primary/10";
  }
  return "border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10";
};

const supplierName = (order: UserOrderRecord) =>
  order.supplier.companyName ||
  [order.supplier.firstName, order.supplier.lastName]
    .filter(Boolean)
    .join(" ") ||
  order.supplier.email ||
  "Supplier";

const partSummary = (order: UserOrderRecord) => {
  const firstPart = order.items[0]?.partName;
  if (!firstPart) return order.source === "rfq" ? "RFQ order" : "Parts order";
  if (order.items.length === 1) return firstPart;
  return `${firstPart} + ${order.items.length - 1} more`;
};

const vehicleSummary = (order: UserOrderRecord) => {
  if (!order.rfq) return "Direct cart order";
  const vehicle = [
    order.rfq.vehicleYear,
    order.rfq.vehicleMake,
    order.rfq.vehicleModel,
    order.rfq.vehicleTrim,
  ]
    .filter(Boolean)
    .join(" ");
  return vehicle || order.rfq.vehicleVin || order.rfq.publicId;
};

const normalizeStatus = (status: string | undefined) => {
  const value = status?.trim().toLowerCase() ?? "";
  const allowed = new Set<OrderStatus>([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]);
  return allowed.has(value as OrderStatus) ? value : "";
};

const normalizePositiveInteger = (
  value: number | undefined,
  fallback: number,
) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value ?? fallback));
};

export async function getUserOrders(
  filters: UserOrderFilters = {},
): Promise<UserOrdersData> {
  try {
    const page = normalizePositiveInteger(filters.page, 1);
    const pageSize = Math.min(
      50,
      normalizePositiveInteger(filters.pageSize, emptyOrdersData.pagination.pageSize),
    );
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    const status = normalizeStatus(filters.status);
    if (status) params.set("status", status);
    if (filters.search?.trim()) params.set("search", filters.search.trim());

    const response = await requestBackend(`/api/v1/orders?${params}`, {
      cookieHeader: (await cookies()).toString(),
    });
    if (!response.ok) return emptyOrdersData;

    const payload = (await response.json()) as UserOrdersPayload;
    if (!payload.ok) return emptyOrdersData;

    return {
      orders: payload.orders ?? [],
      pagination: payload.pagination ?? emptyOrdersData.pagination,
      summary: payload.summary ?? emptyOrdersData.summary,
    };
  } catch {
    return emptyOrdersData;
  }
}

export function mapUserOrders(orders: UserOrderRecord[]): Order[] {
  return orders.map((order) => ({
    id: order.publicId,
    date: formatDate(order.createdAt),
    part: partSummary(order),
    vehicle: vehicleSummary(order),
    supplier: supplierName(order),
    total: formatMoney(order.totalAmount),
    deliveryProgress: order.deliveryProgress,
    deliveredItemCount: order.deliveredItemCount,
    totalItemCount: order.totalItemCount,
    status: statusLabel(order.status),
    badgeClass: badgeClass(order.status),
    items: order.items,
    source: order.source,
    deliveryAddress: [
      order.deliveryRecipientName,
      order.deliveryPhone,
      order.deliveryAddressLine1,
      order.deliveryAddressLine2,
      order.deliveryLandmark,
      order.deliveryCity,
      order.deliveryState,
      order.deliveryPostalCode,
      order.deliveryCountry,
    ]
      .filter(Boolean)
      .join(", "),
    paymentStatus: order.paymentStatus,
    expectedDeliveryAt: order.expectedDeliveryAt,
    proofOfDeliveryUrl: order.proofOfDeliveryUrl,
    proofOfDeliveryNote: order.proofOfDeliveryNote,
    proofRecipientName: order.proofRecipientName,
    proofSubmittedAt: order.proofSubmittedAt,
  }));
}

export function buildUserOrderStats(summary: UserOrdersData["summary"]) {
  const processing =
    (summary.byStatus.pending ?? 0) +
    (summary.byStatus.confirmed ?? 0) +
    (summary.byStatus.processing ?? 0);

  return [
    {
      title: "Total Orders",
      value: String(summary.totalOrders),
      valueClass: "text-foreground",
    },
    {
      title: "Processing",
      value: String(processing),
      valueClass: "text-brand-warning",
    },
    {
      title: "In Transit",
      value: String(summary.byStatus.shipped ?? 0),
      valueClass: "text-brand-info",
    },
    {
      title: "Delivered",
      value: String(summary.byStatus.delivered ?? 0),
      valueClass: "text-primary",
    },
  ];
}
