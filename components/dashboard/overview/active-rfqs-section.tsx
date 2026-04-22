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

type ActiveRfq = {
  id: string
  part: string
  vehicle: string
  quotes: string
  status: string
  expires: string
}

type ActiveRfqsSectionProps = {
  rfqs: ActiveRfq[]
}

const tableHeaders = ["RFQ ID", "Part", "Vehicle", "Quotes", "Status", "Expires"]

export function ActiveRfqsSection({ rfqs }: ActiveRfqsSectionProps) {
  return (
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
              {rfqs.map((rfq) => (
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
  )
}
