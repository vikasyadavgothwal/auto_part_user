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

type Rfq = {
  id: string
  date: string
  part: string
  vehicle: string
  quotes: string
  bestPrice: string
  status: string
  expires: string
  buttonText: string
  buttonClass: string
  badgeClass: string
}

type RfqsTableProps = {
  rfqs: Rfq[]
}

const tableHeaders = [
  "RFQ ID",
  "Date",
  "Part Requested",
  "Vehicle",
  "Quotes",
  "Best Price",
  "Status",
  "Expires",
  " ",
]

export function RfqsTable({ rfqs }: RfqsTableProps) {
  return (
    <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel py-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
              {tableHeaders.map((header, index) => (
                <TableHead
                  key={`${header}-${index}`}
                  className="px-6 py-4 text-left text-sm font-semibold text-brand-muted"
                >
                  {header}
                </TableHead>
              ))}
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
                    className={`rounded-sm px-4 py-1.5 text-sm transition-all ${rfq.buttonClass}`}
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
  )
}
