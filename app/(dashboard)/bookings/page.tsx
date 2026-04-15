"use client";

import Link from "next/link";
import { Calendar, Plus } from "lucide-react";

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
    title: "Upcoming",
    value: "2",
    subtitle: "",
    icon: Calendar,
    showIcon: true,
  },
  {
    title: "Completed",
    value: "1",
    subtitle: "",
    showIcon: false,
  },
  {
    title: "Total Spent",
    value: "$145",
    subtitle: "",
    showIcon: false,
  },
];

const bookings = [
  {
    id: "BK-001",
    date: "Tomorrow",
    time: "2:00 PM",
    garage: "AutoFix Garage",
    service: "Oil Change",
    vehicle: "2019 Toyota Camry",
    price: "$45.00",
    status: "Confirmed",
    badgeClass:
      "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10",
  },
  {
    id: "BK-002",
    date: "Jan 28",
    time: "10:00 AM",
    garage: "Quick Service Center",
    service: "Brake Inspection",
    vehicle: "2021 Honda Accord",
    price: "$65.00",
    status: "Confirmed",
    badgeClass:
      "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10",
  },
  {
    id: "BK-003",
    date: "Jan 20",
    time: "3:00 PM",
    garage: "AutoFix Garage",
    service: "Tire Rotation",
    vehicle: "2019 Toyota Camry",
    price: "$35.00",
    status: "Completed",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
];

const popularServices = [
  "Oil Change",
  "Brake Service",
  "Tire Rotation",
  "AC Service",
];

export default function MyBookingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="text-brand-muted">Manage your service appointments.</p>
        </div>

        <Button
          asChild
          className="h-auto w-full gap-2 rounded-lg bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Link href="/services">
            <Plus className="h-5 w-5" />
            Book Service
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((item) => {
        //   const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="rounded-lg border border-border bg-brand-panel"
            >
              <CardContent className="p-6">
                {item.showIcon ? (
                  <div className="mb-2 flex items-center gap-3">
                    {/* <Icon className="h-5 w-5 text-primary" /> */}
                    <div className="text-sm text-brand-muted">{item.title}</div>
                  </div>
                ) : (
                  <div className="mb-2 text-sm text-brand-muted">{item.title}</div>
                )}

                <div className="text-3xl font-bold text-foreground">{item.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden rounded-lg border border-border bg-brand-panel">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Booking ID
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Date
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Time
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Garage
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Service
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Vehicle
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Price
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
                >
                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <span className="font-medium text-primary">
                      {booking.id}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    {booking.date}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    {booking.time}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    {booking.garage}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    {booking.service}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    {booking.vehicle}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <span className="font-semibold text-foreground">
                      {booking.price}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <Badge
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${booking.badgeClass}`}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="rounded-lg border border-border bg-brand-panel">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold text-foreground">Next Appointment</h3>

            <div className="space-y-2">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-brand-muted">Service:</span>
                <span className="font-medium text-foreground">Oil Change</span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-brand-muted">Date &amp; Time:</span>
                <span className="font-medium text-foreground">
                  Tomorrow, 2:00 PM
                </span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-brand-muted">Garage:</span>
                <span className="font-medium text-foreground">AutoFix Garage</span>
              </div>
            </div>

            <Button className="mt-4 w-full rounded-lg bg-brand-panel-strong text-foreground hover:bg-primary">
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-border bg-brand-panel">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold text-foreground">Popular Services</h3>

            <div className="space-y-3">
              {popularServices.map((service) => (
                <Link
                  key={service}
                  href="/services"
                  className="flex items-center justify-between rounded-lg bg-brand-surface p-3 transition-all hover:border hover:border-primary"
                >
                  <span className="text-sm text-foreground">{service}</span>
                  <span className="text-xs text-primary">Book Now →</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}