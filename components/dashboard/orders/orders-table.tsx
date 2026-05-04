import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Order = {
  id: string
  date: string
  part: string
  vehicle: string
  supplier: string
  total: string
  status: string
  badgeClass: string
}

type OrdersTableProps = {
  orders: Order[]
}

const tableHeaders = [
  "Order ID",
  "Date",
  "Part",
  "Vehicle",
  "Supplier",
  "Total",
  "Status",
  "Actions",
]

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
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
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer border-b border-border transition-colors hover:bg-brand-panel-strong"
              >
                <TableCell className="px-6 py-4 text-sm text-brand-muted">
                  <span className="font-medium text-primary">{order.id}</span>
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
  )
}
