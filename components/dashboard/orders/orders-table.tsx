"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth/client";
import { withBasePath } from "@/lib/routes";

export type Order = {
  id: string;
  date: string;
  part: string;
  vehicle: string;
  supplier: string;
  total: string;
  deliveryProgress: number;
  deliveredItemCount: number;
  totalItemCount: number;
  status: string;
  badgeClass: string;
  source: "rfq" | "direct";
  deliveryAddress: string;
  paymentStatus: "pending" | "succeeded" | "failed" | "refunded";
  expectedDeliveryAt: string | null;
  proofOfDeliveryUrl: string | null;
  proofOfDeliveryNote: string | null;
  proofRecipientName: string | null;
  proofSubmittedAt: string | null;
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
};

type OrdersTableProps = {
  orders: Order[];
};

const tableHeaders = [
  "Order ID",
  "Date",
  "Part",
  "Vehicle",
  "Supplier",
  "Total",
  "Status",
  "Actions",
];

const deliveryOptions = [
  { value: "24_hours", label: "24 hours" },
  { value: "48_hours", label: "48 hours" },
  { value: "72_hours", label: "72 hours" },
  { value: "one_week", label: "One week" },
  { value: "one_month", label: "One month" },
  { value: "more_than_one_month", label: "More than one month" },
] as const;

const deliveryLabel = (value: string | null | undefined) =>
  deliveryOptions.find((option) => option.value === value)?.label ?? "Not scheduled";

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewItem, setReviewItem] = useState<Order["items"][number] | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openReview(item: Order["items"][number]) {
    setReviewItem(item);
    setRating(item.review?.rating ?? 5);
    setComment(item.review?.comment ?? "");
    setError(null);
  }

  function submitReview() {
    if (!reviewItem) return;
    const isEditing = Boolean(reviewItem.review);
    setError(null);

    startTransition(async () => {
      try {
        const response = await authenticatedFetch(
          withBasePath("/api/supplier-product-reviews"),
          {
            method: isEditing ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderItemId: reviewItem.id,
              rating,
              comment,
            }),
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          setError(payload?.message ?? "Unable to save review");
          return;
        }

        toast.success(isEditing ? "Review updated successfully" : "Review saved successfully");
        setReviewItem(null);
        router.refresh();
      } catch {
        setError("Unable to reach the server. Please try again.");
      }
    });
  }

  return (
    <>
      <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel py-0">
        <div className="no-scrollbar overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                {tableHeaders.map((header) => (
                  <TableHead
                    key={header}
                    className="px-6 py-4 text-left text-sm font-semibold text-brand-muted"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.length ? (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
                  >
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-medium text-primary">
                        {order.id}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {order.date}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {order.part}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {order.vehicle}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {order.supplier}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-semibold text-foreground">
                        {order.total}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <div className="min-w-32">
                        <Badge
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${order.badgeClass}`}
                        >
                          {order.status}
                        </Badge>
                        <div className="mt-2 h-1.5 rounded-full bg-brand-surface">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${order.deliveryProgress}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-brand-muted">{order.deliveryProgress}% delivered</p>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <Button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-sm bg-brand-panel-strong px-4 py-1.5 text-sm text-foreground hover:bg-primary"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableHeaders.length}
                    className="px-6 py-10 text-center text-sm text-brand-muted"
                  >
                    No orders found. Product checkout orders will appear here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-border bg-brand-panel text-foreground sm:max-w-2xl">
          {selectedOrder ? (
            <>
              <DialogHeader>
                <DialogTitle>Order {selectedOrder.id}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-sm border border-border bg-brand-surface p-4">
                  <p className="text-brand-muted">Status</p>
                  <Badge
                    className={`mt-2 rounded-full border px-3 py-1 text-xs font-medium ${selectedOrder.badgeClass}`}
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="rounded-sm border border-border bg-brand-surface p-4">
                  <p className="text-brand-muted">Total</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {selectedOrder.total}
                  </p>
                </div>
                <div className="rounded-sm border border-border bg-brand-surface p-4">
                  <p className="text-brand-muted">Supplier</p>
                  <p className="mt-2 text-foreground">
                    {selectedOrder.supplier}
                  </p>
                </div>
                <div className="rounded-sm border border-border bg-brand-surface p-4">
                  <p className="text-brand-muted">Order type</p>
                  <p className="mt-2 text-foreground">
                    {selectedOrder.source === "direct"
                      ? "Cart order"
                      : "RFQ order"}
                  </p>
                </div>
                <div className="rounded-sm border border-border bg-brand-surface p-4">
                  <p className="text-brand-muted">Payment</p>
                  <p className="mt-2 font-semibold capitalize text-brand-success">{selectedOrder.paymentStatus}</p>
                </div>
                <div className="rounded-sm border border-border bg-brand-surface p-4">
                  <p className="text-brand-muted">Delivery progress</p>
                  <div className="mt-3 h-2 rounded-full bg-brand-panel">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${selectedOrder.deliveryProgress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-brand-muted">
                    {selectedOrder.deliveredItemCount} of {selectedOrder.totalItemCount} items delivered ({selectedOrder.deliveryProgress}%)
                  </p>
                </div>
                {selectedOrder.expectedDeliveryAt ? (
                  <div className="rounded-sm border border-border bg-brand-surface p-4">
                    <p className="text-brand-muted">Expected delivery</p>
                    <p className="mt-2 font-semibold text-foreground">
                      {new Date(selectedOrder.expectedDeliveryAt).toLocaleDateString("en-AE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ) : null}
              </div>

              {selectedOrder.proofSubmittedAt ? (
                <div className="rounded-sm border border-brand-success/30 bg-brand-success/5 p-4 text-sm">
                  <p className="font-semibold text-foreground">Proof of delivery</p>
                  <p className="mt-2 text-brand-muted">Submitted {new Date(selectedOrder.proofSubmittedAt).toLocaleString("en-AE")}{selectedOrder.proofRecipientName ? ` · Received by ${selectedOrder.proofRecipientName}` : ""}</p>
                  {selectedOrder.proofOfDeliveryNote ? <p className="mt-1 text-brand-muted">{selectedOrder.proofOfDeliveryNote}</p> : null}
                  {selectedOrder.proofOfDeliveryUrl ? <a className="mt-2 inline-block font-medium text-primary hover:underline" href={`/user_dashboard/api/orders/${encodeURIComponent(selectedOrder.id)}/proof`} target="_blank" rel="noreferrer">View delivery proof</a> : null}
                </div>
              ) : null}

              <div className="rounded-sm border border-border bg-brand-surface p-4">
                <p className="font-semibold text-foreground">
                  Delivery address
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-brand-muted">
                  {selectedOrder.deliveryAddress ||
                    "No delivery address saved for this order."}
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-foreground">Items</p>
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={`${item.partName}-${index}`}
                    className="grid gap-2 rounded-sm border border-border bg-brand-surface p-4 text-sm sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {item.partName}
                      </p>
                      <p className="mt-1 text-brand-muted">
                        {item.partNumber || "No part number"} | Qty{" "}
                        {item.quantity}
                      </p>
                      <p className="mt-1 text-brand-muted">
                        Delivery: {deliveryLabel(item.deliveryOption)}
                        {item.expectedDeliveryAt ? ` | Expected ${new Date(item.expectedDeliveryAt).toLocaleDateString("en-AE")}` : ""}
                      </p>
                      {item.deliveredAt ? (
                        <p className="mt-1 text-brand-success">
                          Delivered {new Date(item.deliveredAt).toLocaleString("en-AE")}
                          {item.proofRecipientName ? ` to ${item.proofRecipientName}` : ""}
                        </p>
                      ) : null}
                      {item.buyerConfirmedAt ? (
                        <p className="mt-1 text-brand-muted">
                          Receipt confirmed {new Date(item.buyerConfirmedAt).toLocaleString("en-AE")}
                        </p>
                      ) : null}
                      {item.proofOfDeliveryNote ? <p className="mt-1 text-brand-muted">{item.proofOfDeliveryNote}</p> : null}
                      {item.review ? (
                        <p className="mt-2 text-xs text-brand-muted">
                          Your review: {item.review.rating}/5
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-end sm:text-right">
                      <p className="font-semibold text-foreground">
                        AED {(item.lineTotal ?? 0).toFixed(2)}
                      </p>
                      {item.proofOfDeliveryUrl ? (
                        <a className="mt-1 inline-block text-xs font-medium text-primary hover:underline" href={`/user_dashboard/api/orders/${encodeURIComponent(selectedOrder.id)}/proof?itemId=${encodeURIComponent(item.id)}`} target="_blank" rel="noreferrer">View proof</a>
                      ) : null}
                      {item.deliveredAt ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => openReview(item)}
                          className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {item.review ? "Edit review" : "Review supplier"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(reviewItem)}
        onOpenChange={(open) => {
          if (!open) setReviewItem(null);
        }}
      >
        <DialogContent className="border-border bg-brand-panel text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reviewItem?.review ? "Edit supplier review" : "Review supplier"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="font-medium text-foreground">{reviewItem?.partName}</p>
              <p className="mt-1 text-sm text-brand-muted">
                {reviewItem?.partNumber || "No part number"}
              </p>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-foreground">
                Rating
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      className="rounded-sm p-1"
                      onClick={() => setRating(value)}
                      aria-label={`${value} star rating`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          value <= rating
                            ? "fill-primary text-primary"
                            : "text-border"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Review
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-28 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                maxLength={1000}
                placeholder="Share your experience with this supplier and product"
              />
            </label>

            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewItem(null)}
              disabled={isPending}
              className="rounded-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitReview}
              disabled={isPending || !comment.trim()}
              className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Saving..." : "Save review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
