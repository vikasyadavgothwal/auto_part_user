"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock, Star } from "lucide-react";
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
import { RequiredMark } from "@/components/ui/required-mark";

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
  garageBookings: Array<{
    id: string;
    publicId: string;
    serviceName: string;
    garageId: string;
    serviceId: string | null;
    bookingDate: string | null;
    bookingTime: string | null;
    durationMinutes: number;
    price: number;
    currency: string;
    status: "pending" | "pending_slot_selection" | "confirmed" | "completed" | "cancelled";
    linkedOrderId: string | null;
    canSelectSlot?: boolean;
    garage: {
      companyName: string | null;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    };
  }>;
};

type OrdersTableProps = {
  orders: Order[];
};

type VehicleRecord = {
  id: string;
  year: string;
  make: string;
  model: string;
  vin: string;
  mileage: string;
  status: string;
  primary: boolean;
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

const slotTimes = Array.from({ length: 35 }, (_, index) => {
  const minutes = 9 * 60 + index * 15;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
});

const dateOptions = Array.from({ length: 14 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index);
  const value = date.toISOString().slice(0, 10);
  return {
    value,
    label: date.toLocaleDateString("en-AE", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  };
});

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewItem, setReviewItem] = useState<Order["items"][number] | null>(null);
  const [slotBooking, setSlotBooking] = useState<Order["garageBookings"][number] | null>(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function openReview(item: Order["items"][number]) {
    setReviewItem(item);
    setRating(item.review?.rating ?? 5);
    setComment(item.review?.comment ?? "");
  }

  function submitReview() {
    if (!reviewItem) return;
    const normalizedComment = comment.trim();
    if (rating < 1 || rating > 5) {
      toast.error("Select a rating between 1 and 5 stars");
      return;
    }
    if (normalizedComment.length < 3 || !/[\p{L}\p{N}]/u.test(normalizedComment)) {
      toast.error("Review must be at least 3 characters");
      return;
    }
    const isEditing = Boolean(reviewItem.review);

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
              comment: normalizedComment,
            }),
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(payload?.message ?? "Unable to save review");
        }

        toast.success(isEditing ? "Review updated successfully" : "Review saved successfully");
        setReviewItem(null);
        router.refresh();
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Unable to reach the server. Please try again.");
      }
    });
  }

  function garageName(booking: Order["garageBookings"][number]) {
    return (
      booking.garage.companyName ||
      [booking.garage.firstName, booking.garage.lastName].filter(Boolean).join(" ") ||
      booking.garage.email ||
      "Garage"
    );
  }

  function bookingStatusLabel(status: Order["garageBookings"][number]["status"]) {
    if (status === "pending_slot_selection") return "Awaiting slot selection";
    return status.slice(0, 1).toUpperCase() + status.slice(1);
  }

  function openSlotPicker(booking: Order["garageBookings"][number]) {
    setSlotBooking(booking);
    setSlotDate(dateOptions[0]?.value ?? "");
    setSlotTime("");
    setSelectedVehicleId("");
    setUnavailableTimes([]);
    setIsLoadingVehicles(true);
    setIsLoadingAvailability(Boolean(booking.serviceId));
  }

  useEffect(() => {
    if (!slotBooking) return;
    let mounted = true;
    authenticatedFetch(withBasePath("/api/vehicles?page=1&pageSize=50"), {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; vehicles?: VehicleRecord[]; message?: string }
          | null;
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.message ?? "Unable to load vehicles");
        }
        if (!mounted) return;
        const nextVehicles = payload.vehicles ?? [];
        setVehicles(nextVehicles);
        setSelectedVehicleId(
          nextVehicles.find((vehicle) => vehicle.primary)?.id ??
            nextVehicles[0]?.id ??
            "",
        );
      })
      .catch((caught) => {
        if (!mounted) return;
        setVehicles([]);
        toast.error(caught instanceof Error ? caught.message : "Unable to load vehicles");
      })
      .finally(() => {
        if (mounted) setIsLoadingVehicles(false);
      });
    return () => {
      mounted = false;
    };
  }, [slotBooking]);

  useEffect(() => {
    if (!slotBooking?.serviceId || !slotDate) return;
    let mounted = true;
    const params = new URLSearchParams({
      garageId: slotBooking.garageId,
      serviceId: slotBooking.serviceId,
      bookingDate: slotDate,
    });
    authenticatedFetch(
      withBasePath(`/api/garage-bookings/availability?${params.toString()}`),
      { cache: "no-store" },
    )
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; unavailableTimes?: string[]; message?: string }
          | null;
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.message ?? "Unable to load slots");
        }
        if (!mounted) return;
        setUnavailableTimes(payload.unavailableTimes ?? []);
      })
      .catch((caught) => {
        if (!mounted) return;
        setUnavailableTimes([]);
        toast.error(caught instanceof Error ? caught.message : "Unable to load slots");
      })
      .finally(() => {
        if (mounted) setIsLoadingAvailability(false);
      });
    return () => {
      mounted = false;
    };
  }, [slotBooking, slotDate]);

  function submitSlot() {
    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === selectedVehicleId,
    );
    if (!slotBooking || !slotDate || !slotTime || !selectedVehicle) {
      toast.error("Select car, date, and available time for the service slot.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await authenticatedFetch(
          withBasePath(`/api/garage-bookings/${slotBooking.id}/schedule`),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingDate: slotDate,
              bookingTime: slotTime,
              vehicleYear: selectedVehicle.year,
              vehicleMake: selectedVehicle.make,
              vehicleModel: selectedVehicle.model,
              vehicleVin: selectedVehicle.vin,
            }),
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(payload?.message ?? "Unable to schedule service slot");
        }

        toast.success("Service slot selected");
        setSlotBooking(null);
        router.refresh();
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Unable to reach the server. Please try again.");
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

              {selectedOrder.garageBookings.length ? (
                <div className="space-y-3 rounded-sm border border-border bg-brand-surface p-4">
                  <p className="font-semibold text-foreground">Garage service</p>
                  {selectedOrder.garageBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 rounded-sm border border-border bg-brand-panel p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {booking.serviceName}
                        </p>
                        <p className="mt-1 text-sm text-brand-muted">
                          {garageName(booking)} | {booking.currency}{" "}
                          {booking.price.toFixed(2)}
                        </p>
                        <p className="mt-1 text-sm text-brand-muted">
                          {booking.bookingDate && booking.bookingTime
                            ? `${new Date(`${booking.bookingDate}T12:00:00`).toLocaleDateString("en-AE")} at ${booking.bookingTime}`
                            : bookingStatusLabel(booking.status)}
                        </p>
                      </div>
                      {booking.canSelectSlot ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => openSlotPicker(booking)}
                          className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <CalendarClock className="mr-2 h-4 w-4" />
                          Select slot
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

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
                Rating<RequiredMark />
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
              Review<RequiredMark />
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-28 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                maxLength={1000}
                minLength={3}
                required
                placeholder="Share your experience with this supplier and product"
              />
            </label>

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

      <Dialog
        open={Boolean(slotBooking)}
        onOpenChange={(open) => {
          if (!open) setSlotBooking(null);
        }}
      >
        <DialogContent className="border-border bg-brand-panel text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select service slot</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <p className="text-sm font-medium text-foreground">Car<RequiredMark /></p>
              {isLoadingVehicles ? (
                <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-brand-muted">
                  Loading cars...
                </p>
              ) : vehicles.length ? (
                <div className="grid gap-2">
                  {vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                        selectedVehicleId === vehicle.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-brand-muted hover:border-primary/60"
                      }`}
                    >
                      <span className="block font-medium text-foreground">
                        {[vehicle.year, vehicle.make, vehicle.model]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                      <span className="block text-xs">{vehicle.vin}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-brand-muted">
                  Add a car in My Vehicles before selecting a service slot.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-medium text-foreground">Available date<RequiredMark /></p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {dateOptions.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    onClick={() => {
                      setUnavailableTimes([]);
                      setSlotTime("");
                      setIsLoadingAvailability(Boolean(slotBooking?.serviceId));
                      setSlotDate(date.value);
                    }}
                    className={`h-10 rounded-sm border px-3 text-sm transition-colors ${
                      slotDate === date.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-brand-muted hover:border-primary/60"
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-medium text-foreground">Available slots<RequiredMark /></p>
              {isLoadingAvailability ? (
                <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-brand-muted">
                  Loading slots...
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slotTimes
                    .filter((time) => !unavailableTimes.includes(time))
                    .map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSlotTime(time)}
                        className={`h-10 rounded-sm border px-2 text-sm transition-colors ${
                          slotTime === time
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-brand-muted hover:border-primary/60"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSlotBooking(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                isPending ||
                !slotTime ||
                !selectedVehicleId ||
                isLoadingAvailability ||
                isLoadingVehicles
              }
              onClick={submitSlot}
            >
              {isPending ? "Saving..." : "Confirm slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
