"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authenticatedFetch } from "@/lib/auth/client"
import { withBasePath } from "@/lib/routes"
import type { UserRfq } from "./rfqs-data"

type RfqsTableProps = {
  rfqs: UserRfq[]
  onAccepted: (
    rfqId: string,
    bidId: string,
    order: NonNullable<UserRfq["order"]>,
  ) => void
}

const tableHeaders = [
  "RFQ ID",
  "Date",
  "Parts",
  "Vehicle",
  "Quotes",
  "Best Price",
  "Status",
  "Expires",
  " ",
]

const money = (value: number) =>
  `AED ${value.toLocaleString("en-AE", { minimumFractionDigits: 2 })}`

const supplierName = (bid: UserRfq["bids"][number]) =>
  bid.supplier.companyName ||
  [bid.supplier.firstName, bid.supplier.lastName].filter(Boolean).join(" ") ||
  bid.supplier.email ||
  "Supplier"

const vehicleLabel = (rfq: UserRfq) =>
  [rfq.vehicleYear, rfq.vehicleMake, rfq.vehicleModel, rfq.vehicleTrim]
    .filter(Boolean)
    .join(" ") || "Not specified"

const statusLabel = (rfq: UserRfq) => {
  if (rfq.order) return "Accepted"
  if (rfq.status === "open") return "Active"
  return rfq.status.slice(0, 1).toUpperCase() + rfq.status.slice(1)
}

const statusClass = (rfq: UserRfq) => {
  if (rfq.order) {
    return "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10"
  }
  if (rfq.status === "open") {
    return "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10"
  }
  return "border-border bg-brand-panel-strong text-brand-muted hover:bg-brand-panel-strong"
}

const expiryLabel = (rfq: UserRfq) => {
  if (rfq.status !== "open") return "Completed"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(rfq.responseDeadline)
  deadline.setHours(0, 0, 0, 0)
  const days = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return "Expired"
  if (days === 0) return "Today"
  return `${days} day${days === 1 ? "" : "s"}`
}

export function RfqsTable({ rfqs, onAccepted }: RfqsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmBidId, setConfirmBidId] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const selected = rfqs.find((rfq) => rfq.id === selectedId) ?? null
  const confirmBid = selected?.bids.find((bid) => bid.id === confirmBidId) ?? null

  async function acceptBid(bidId: string) {
    if (!selected) return
    setAccepting(bidId)
    setError("")
    try {
      const response = await authenticatedFetch(
        withBasePath(`/api/rfqs/${selected.id}/bids/${bidId}/accept`),
        { method: "POST" },
      )
      const payload = (await response.json()) as {
        ok: boolean
        order?: NonNullable<UserRfq["order"]>
        message?: string
      }
      if (!response.ok || !payload.ok || !payload.order) {
        throw new Error(payload.message || "Unable to accept quote")
      }
      onAccepted(selected.id, bidId, payload.order)
      setConfirmBidId(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to accept quote")
    } finally {
      setAccepting(null)
    }
  }

  return (
    <>
      <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel py-0">
        <div className="no-scrollbar overflow-x-auto">
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
              {rfqs.map((rfq) => {
                const bestBid = rfq.bids.find(
                  (bid) => bid.status === "submitted" || bid.status === "accepted",
                )
                return (
                  <TableRow
                    key={rfq.id}
                    className="border-b border-border transition-colors hover:bg-brand-panel-strong"
                  >
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-medium text-primary">{rfq.publicId}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {new Date(rfq.createdAt).toLocaleDateString("en-AE")}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {rfq.parts.length} part{rfq.parts.length === 1 ? "" : "s"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {vehicleLabel(rfq)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-semibold text-primary">
                        {rfq.bids.length} received
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <span className="font-semibold text-foreground">
                        {bestBid ? money(bestBid.totalAmount) : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <Badge
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(rfq)}`}
                      >
                        {statusLabel(rfq)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      {expiryLabel(rfq)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-brand-primary-hover"
                        onClick={() => {
                          setSelectedId(rfq.id)
                          setError("")
                        }}
                      >
                        {rfq.order ? "View" : "View Quotes"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {!rfqs.length ? (
                <TableRow>
                  <TableCell
                    colSpan={tableHeaders.length}
                    className="px-6 py-10 text-center text-sm text-brand-muted"
                  >
                    No RFQs found. Create an RFQ to start receiving supplier quotes.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selected?.publicId}: {selected?.projectName}
            </DialogTitle>
            <DialogDescription>
              {selected?.description || "Review all supplier quotations and select the best offer."}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-6">
              <div className="grid gap-3 rounded-sm border border-border bg-brand-surface p-4 text-sm md:grid-cols-2">
                <p>
                  <span className="text-brand-muted">Vehicle:</span>{" "}
                  {vehicleLabel(selected)}
                </p>
                <p>
                  <span className="text-brand-muted">VIN:</span>{" "}
                  {selected.vehicleVin || "-"}
                </p>
                <p>
                  <span className="text-brand-muted">Delivery:</span>{" "}
                  {selected.deliveryRequirement}
                </p>
                <p>
                  <span className="text-brand-muted">Payment:</span>{" "}
                  {selected.paymentTerms}
                </p>
                <p>
                  <span className="text-brand-muted">Deadline:</span>{" "}
                  {new Date(selected.responseDeadline).toLocaleString("en-AE")}
                </p>
                {selected.order ? (
                  <p>
                    <span className="text-brand-muted">Order:</span>{" "}
                    <strong className="text-brand-success">{selected.order.publicId}</strong>
                  </p>
                ) : null}
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-foreground">Requested parts</h3>
                <div className="overflow-x-auto rounded-sm border border-border">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="bg-brand-surface text-brand-muted">
                      <tr>
                        <th className="p-3 text-left">Part</th>
                        <th className="p-3 text-left">Number</th>
                        <th className="p-3 text-left">Qty</th>
                        <th className="p-3 text-left">Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.parts.map((part) => (
                        <tr key={part.id} className="border-t border-border">
                          <td className="p-3">{part.partName}</td>
                          <td className="p-3">{part.partNumber || "-"}</td>
                          <td className="p-3">{part.quantity}</td>
                          <td className="p-3">
                            {part.targetPrice === null ? "-" : money(part.targetPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-foreground">
                  Supplier quotations ({selected.bids.length})
                </h3>
                {selected.bids.length === 0 ? (
                  <p className="rounded-sm border border-border p-5 text-brand-muted">
                    No supplier quotations received yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selected.bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="flex flex-col gap-4 rounded-sm border border-border bg-brand-surface p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{supplierName(bid)}</p>
                          <p className="mt-1 text-sm text-brand-muted">
                            Delivery in {bid.deliveryDays} days
                            {bid.notes ? ` · ${bid.notes}` : ""}
                          </p>
                          <p className="mt-1 text-xs capitalize text-brand-muted">
                            {bid.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <strong className="text-lg text-foreground">
                            {money(bid.totalAmount)}
                          </strong>
                          {selected.status === "open" && bid.status === "submitted" ? (
                            <Button
                              disabled={Boolean(accepting)}
                              onClick={() => {
                                setError("")
                                setConfirmBidId(bid.id)
                              }}
                              className="bg-primary text-primary-foreground hover:bg-brand-primary-hover"
                            >
                              Accept Quote
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(confirmBid)}
        onOpenChange={(open) => {
          if (!open && !accepting) setConfirmBidId(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept supplier quotation?</DialogTitle>
            <DialogDescription>
              This creates an order and rejects all other submitted quotes for{" "}
              {selected?.publicId}.
            </DialogDescription>
          </DialogHeader>
          {confirmBid ? (
            <div className="space-y-3 rounded-sm border border-border bg-brand-surface p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-brand-muted">Supplier</span>
                <span className="text-right font-medium">{supplierName(confirmBid)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-brand-muted">Total quote</span>
                <strong>{money(confirmBid.totalAmount)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-brand-muted">Delivery</span>
                <span>{confirmBid.deliveryDays} days</span>
              </div>
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={Boolean(accepting)}
              onClick={() => setConfirmBidId(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={!confirmBid || Boolean(accepting)}
              onClick={() => confirmBid && void acceptBid(confirmBid.id)}
              className="bg-primary text-primary-foreground hover:bg-brand-primary-hover"
            >
              {accepting ? "Creating order..." : "Accept Quote & Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
