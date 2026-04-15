"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

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
    title: "Total RFQs",
    value: "4",
    valueClass: "text-foreground",
  },
  {
    title: "Active",
    value: "2",
    valueClass: "text-primary",
  },
  {
    title: "Total Quotes",
    value: "18",
    valueClass: "text-foreground",
  },
  {
    title: "Accepted",
    value: "1",
    valueClass: "text-foreground",
  },
];

const rfqs = [
  {
    id: "RFQ-001",
    date: "2024-01-22",
    part: "Transmission Fluid",
    vehicle: "2019 Toyota Camry",
    quotes: "3 received",
    bestPrice: "$45.99",
    status: "Active",
    expires: "2 days",
    buttonText: "View Quotes",
    buttonClass: "bg-primary text-primary-foreground hover:bg-brand-primary-hover",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
  {
    id: "RFQ-002",
    date: "2024-01-20",
    part: "Spark Plugs",
    vehicle: "2019 Toyota Camry",
    quotes: "5 received",
    bestPrice: "$32.50",
    status: "Active",
    expires: "5 days",
    buttonText: "View Quotes",
    buttonClass: "bg-primary text-primary-foreground hover:bg-brand-primary-hover",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
  {
    id: "RFQ-003",
    date: "2024-01-18",
    part: "Brake Rotors",
    vehicle: "2021 Honda Accord",
    quotes: "4 received",
    bestPrice: "$120.00",
    status: "Closed",
    expires: "Expired",
    buttonText: "View",
    buttonClass: "bg-brand-panel-strong text-brand-muted hover:bg-brand-panel-strong",
    badgeClass:
      "border-border bg-brand-panel-strong text-brand-muted hover:bg-brand-panel-strong",
  },
  {
    id: "RFQ-004",
    date: "2024-01-15",
    part: "Battery",
    vehicle: "2018 Ford F-150",
    quotes: "6 received",
    bestPrice: "$89.99",
    status: "Accepted",
    expires: "Completed",
    buttonText: "View",
    buttonClass: "bg-brand-panel-strong text-brand-muted hover:bg-brand-panel-strong",
    badgeClass:
      "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10",
  },
];

const steps = [
  {
    title: "1. Submit Request",
    description:
      "Describe the part you need and specify your vehicle details.",
  },
  {
    title: "2. Receive Quotes",
    description:
      "Multiple suppliers compete to offer you the best price and delivery time.",
  },
  {
    title: "3. Accept & Order",
    description:
      "Compare offers and accept the best quote to complete your purchase.",
  },
];

export default function MyRfqsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My RFQs</h1>
          <p className="text-brand-muted">
            Request quotes and compare offers from multiple suppliers.
          </p>
        </div>

        <Button
          asChild
          className="h-auto w-full gap-2 rounded-lg bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Link href="/rfq">
            <Plus className="h-5 w-5" />
            Create RFQ
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card
            key={item.title}
            className="rounded-lg border border-border bg-brand-panel"
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

      <Card className="overflow-hidden rounded-lg border border-border bg-brand-panel">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  RFQ ID
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Date
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Part Requested
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Vehicle
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Quotes
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Best Price
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  Expires
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                  {" "}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rfqs.map((rfq) => (
                <TableRow
                  key={rfq.id}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
                >
                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <span className="font-medium text-primary">{rfq.id}</span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    {rfq.date}
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
                    <span className="font-semibold text-foreground">
                      {rfq.bestPrice}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <Badge
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${rfq.badgeClass}`}
                    >
                      {rfq.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <span className="text-brand-muted">{rfq.expires}</span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <Button
                      className={`rounded-lg px-4 py-1.5 text-sm transition-all ${rfq.buttonClass}`}
                    >
                      {rfq.buttonText}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="rounded-lg border border-border bg-brand-panel">
        <CardContent className="p-6">
          <h3 className="mb-2 font-semibold text-foreground">How RFQs Work</h3>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title}>
                <div className="mb-2 font-bold text-primary">
                  {step.title}
                </div>
                <p className="text-sm text-brand-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}