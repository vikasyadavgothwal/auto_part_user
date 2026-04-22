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

type Booking = {
  id: string
  date: string
  time: string
  garage: string
  service: string
  vehicle: string
  price: string
  status: string
  badgeClass: string
}

type BookingsTableProps = {
  bookings: Booking[]
}

const tableHeaders = [
  "Booking ID",
  "Date",
  "Time",
  "Garage",
  "Service",
  "Vehicle",
  "Price",
  "Status",
]

export function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel">
      <div className="overflow-x-auto">
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
  )
}
