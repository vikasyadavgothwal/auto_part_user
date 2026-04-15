"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  Package,
  Search,
  ShoppingCart,
  Truck,
  Wrench,
} from "lucide-react";

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

const overviewStats = [
  {
    title: "Active Orders",
    value: "3",
    subtext: "2 in transit",
    icon: ShoppingCart,
  },
  {
    title: "Active RFQs",
    value: "2",
    subtext: "8 quotes received",
    icon: FileText,
  },
  {
    title: "Upcoming Bookings",
    value: "1",
    subtext: "Next: Tomorrow 2PM",
    icon: Calendar,
  },
  {
    title: "Saved Parts",
    value: "12",
    subtext: "In watchlist",
    icon: Package,
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    part: "Brake Pads - Front",
    vehicle: "2019 Toyota Camry",
    status: "Shipped",
    statusClass:
      "bg-brand-info/10 text-brand-info border-brand-info/20 hover:bg-brand-info/10",
    date: "2024-01-15",
    total: "$89.99",
  },
  {
    id: "ORD-002",
    part: "Oil Filter",
    vehicle: "2019 Toyota Camry",
    status: "Delivered",
    statusClass:
      "bg-brand-success/10 text-brand-success border-brand-success/20 hover:bg-brand-success/10",
    date: "2024-01-10",
    total: "$24.99",
  },
  {
    id: "ORD-003",
    part: "Air Filter",
    vehicle: "2019 Toyota Camry",
    status: "Processing",
    statusClass:
      "bg-brand-warning/10 text-brand-warning border-brand-warning/20 hover:bg-brand-warning/10",
    date: "2024-01-18",
    total: "$19.99",
  },
];

const activeRfqs = [
  {
    id: "RFQ-001",
    part: "Transmission Fluid",
    vehicle: "2019 Toyota Camry",
    quotes: "3 received",
    status: "Active",
    expires: "2 days",
  },
  {
    id: "RFQ-002",
    part: "Spark Plugs",
    vehicle: "2019 Toyota Camry",
    quotes: "5 received",
    status: "Active",
    expires: "5 days",
  },
];

const recommendedProducts = Array.from({ length: 3 }).map((_, i) => ({
  id: i + 1,
  title: "Premium Brake Pads",
  subtitle: "Fits your 2019 Toyota Camry",
  price: "$89.99",
}));

export default function BuyerOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-brand-muted">
          Welcome back! Here&apos;s your activity summary.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="rounded-lg border border-border bg-brand-panel transition-all hover:border-primary"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="text-sm font-medium text-brand-muted">
                    {item.title}
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-3xl font-bold text-foreground">
                    {item.value}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-brand-muted">{item.subtext}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-lg border border-border bg-brand-panel">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="mb-1 text-xl font-bold text-foreground">My Vehicle</h2>
              <p className="text-sm text-brand-muted">
                Primary vehicle for parts search
              </p>
            </div>

            <Link
              href="/dashboard/buyer/vehicles"
              className="text-sm font-medium text-primary transition-colors hover:text-brand-primary-hover"
            >
              Manage Vehicles
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:gap-6">
            <div className="w-fit rounded-lg border border-primary/20 bg-primary/10 p-4">
              <Truck className="h-8 w-8 text-primary" />
            </div>

            <div>
              <h3 className="mb-1 text-2xl font-bold text-foreground">
                2019 Toyota Camry
              </h3>
              <p className="text-sm text-brand-muted">
                VIN: JT2BF22K6X0123456
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button
              asChild
              className="h-auto rounded-lg bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover"
            >
              <Link
                href="/search"
                className="flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                Search Parts
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto rounded-lg border-border bg-brand-panel-strong px-6 py-3 text-foreground hover:border-primary hover:bg-brand-panel-strong"
            >
              <Link
                href="/services"
                className="flex items-center justify-center gap-2"
              >
                <Wrench className="h-5 w-5" />
                Book Service
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
          <Link
            href="/dashboard/buyer/orders"
            className="text-sm font-medium text-primary transition-colors hover:text-brand-primary-hover"
          >
            View All
          </Link>
        </div>

        <Card className="overflow-hidden rounded-lg border border-border bg-brand-panel">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Order ID
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Part
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Vehicle
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
                  >
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {order.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {order.part}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {order.vehicle}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <Badge
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${order.statusClass}`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {order.date}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-semibold text-foreground">
                        {order.total}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">Active RFQs</h2>
          <Link
            href="/dashboard/buyer/rfqs"
            className="text-sm font-medium text-primary transition-colors hover:text-brand-primary-hover"
          >
            View All
          </Link>
        </div>

        <Card className="overflow-hidden rounded-lg border border-border bg-brand-panel">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    RFQ ID
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Part
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Vehicle
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Quotes
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Expires
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {activeRfqs.map((rfq) => (
                  <TableRow
                    key={rfq.id}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
                  >
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.part}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.vehicle}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-semibold text-primary">
                        {rfq.quotes}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <Badge className="rounded-full border border-brand-success/20 bg-brand-success/10 px-3 py-1 text-xs font-medium text-brand-success hover:bg-brand-success/10">
                        {rfq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="text-brand-muted">{rfq.expires}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">
          Recommended for Your Vehicle
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recommendedProducts.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer rounded-lg border border-border bg-brand-panel transition-all hover:border-primary"
            >
              <CardContent className="p-6">
                <div className="mb-4 aspect-square rounded-lg bg-brand-panel-strong" />

                <h3 className="mb-2 font-semibold text-foreground">
                  {product.title}
                </h3>

                <p className="mb-4 text-sm text-brand-muted">
                  {product.subtitle}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xl font-bold text-primary">
                    {product.price}
                  </span>

                  <Button className="bg-primary text-primary-foreground hover:bg-brand-primary-hover">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}