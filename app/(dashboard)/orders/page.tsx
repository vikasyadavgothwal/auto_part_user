"use client";

import { Download, Funnel } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  {
    title: "Total Orders",
    value: "4",
    valueClass: "text-foreground",
  },
  {
    title: "Processing",
    value: "1",
    valueClass: "text-brand-warning",
  },
  {
    title: "In Transit",
    value: "1",
    valueClass: "text-brand-info",
  },
  {
    title: "Delivered",
    value: "2",
    valueClass: "text-primary",
  },
];

const filters = [
  { label: "All Orders", active: true },
  { label: "Processing", active: false },
  { label: "Shipped", active: false },
  { label: "Delivered", active: false },
];

const orders = [
  {
    id: "ORD-001",
    date: "2024-01-20",
    part: "Brake Pads - Front",
    vehicle: "2019 Toyota Camry",
    supplier: "Acme Auto Parts",
    total: "$89.99",
    status: "Shipped",
    badgeClass:
      "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10",
  },
  {
    id: "ORD-002",
    date: "2024-01-18",
    part: "Oil Filter",
    vehicle: "2019 Toyota Camry",
    supplier: "Premium Parts Co",
    total: "$24.99",
    status: "Delivered",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
  {
    id: "ORD-003",
    date: "2024-01-22",
    part: "Air Filter",
    vehicle: "2021 Honda Accord",
    supplier: "QuickParts Supply",
    total: "$19.99",
    status: "Processing",
    badgeClass:
      "border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10",
  },
  {
    id: "ORD-004",
    date: "2024-01-15",
    part: "Spark Plugs",
    vehicle: "2018 Ford F-150",
    supplier: "Acme Auto Parts",
    total: "$45.50",
    status: "Delivered",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
];

export default function MyOrdersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My Orders</h1>
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card
            key={item.title}
            className="rounded-sm border border-border bg-brand-panel"
          >
            <CardContent className="p-6">
              <div className="mb-2 text-sm text-brand-muted">{item.title}</div>
              <div className={`text-3xl font-bold ${item.valueClass}`}>
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 text-brand-muted">
          <Funnel className="h-5 w-5" />
          <span className="font-medium">Filter:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.label}
              variant="outline"
              className={
                filter.active
                  ? "rounded-sm border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "rounded-sm border-border bg-brand-panel text-brand-muted hover:border-primary hover:bg-brand-panel hover:text-brand-muted"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Order ID
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Date
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Part
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Vehicle
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Supplier
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Total
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
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
                    <Button className="rounded-sm bg-brand-panel-strong px-4 py-1.5 text-sm text-foreground hover:bg-primary">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}