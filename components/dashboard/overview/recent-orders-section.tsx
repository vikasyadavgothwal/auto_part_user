import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type RecentOrder = {
  id: string
  part: string
  vehicle: string
  status: string
  statusClass: string
  date: string
  total: string
}

type RecentOrdersSectionProps = {
  orders: RecentOrder[]
}

const tableHeaders = ["Order ID", "Part", "Vehicle", "Status", "Date", "Total"]

export function RecentOrdersSection({ orders }: RecentOrdersSectionProps) {
  return (
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

      <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel py-0">
        <div className="overflow-x-auto">
          <Table >
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
              {orders.map((order) => (
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
  )
}
