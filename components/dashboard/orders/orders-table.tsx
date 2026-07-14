"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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

export type Order = {
  id: string;
  date: string;
  part: string;
  vehicle: string;
  supplier: string;
  total: string;
  status: string;
  badgeClass: string;
  source: "rfq" | "direct";
  deliveryAddress: string;
  items: Array<{
    partName: string;
    partNumber: string | null;
    quantity: number;
    unitPrice: number | null;
    lineTotal: number | null;
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

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
                      <Badge
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${order.badgeClass}`}
                      >
                        {order.status}
                      </Badge>
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
              </div>

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
                    </div>
                    <p className="font-semibold text-foreground">
                      AED {(item.lineTotal ?? 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
