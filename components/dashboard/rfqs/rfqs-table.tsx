"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

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
import { readApiResponse } from "@/lib/api-response"
import { authenticatedFetch } from "@/lib/auth/client"
import { appRoutes, withBasePath } from "@/lib/routes"
import type { UserAddressRecord } from "@/lib/user-addresses"
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

const addressOptionLabel = (address: UserAddressRecord) =>
  `${address.label}${address.isDefault ? " (Default)" : ""} - ${address.city}, ${address.postalCode}`

const addressSummary = (address: UserAddressRecord) =>
  [
    address.recipientName,
    address.phone,
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ")

export function RfqsTable({ rfqs, onAccepted }: RfqsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmBidId, setConfirmBidId] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<UserAddressRecord[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [error, setError] = useState("")
  const selected = rfqs.find((rfq) => rfq.id === selectedId) ?? null
  const confirmBid = selected?.bids.find((bid) => bid.id === confirmBidId) ?? null
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null
  const shouldLoadAddresses = Boolean(selected && !selected.order && selected.status === "open")

  const openRfq = (rfq: UserRfq) => {
    setSelectedId(rfq.id)
    setConfirmBidId(null)
    setAddresses([])
    setSelectedAddressId("")
    setIsLoadingAddresses(!rfq.order && rfq.status === "open")
    setError("")
  }

  useEffect(() => {
    if (!shouldLoadAddresses) return

    let mounted = true
    authenticatedFetch(withBasePath("/api/addresses"), {
      method: "GET",
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await readApiResponse<{
          ok: boolean
          addresses?: UserAddressRecord[]
          message?: string
        }>(response, "Unable to load delivery addresses")
        if (!mounted) return
        const nextAddresses = payload.addresses ?? []
        setAddresses(nextAddresses)
        setSelectedAddressId(
          (current) =>
            (current && nextAddresses.some((address) => address.id === current)
              ? current
              : "") ||
            nextAddresses.find((address) => address.isDefault)?.id ||
            nextAddresses[0]?.id ||
            "",
        )
      })
      .catch((caught) => {
        if (mounted) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load delivery addresses",
          )
        }
      })
      .finally(() => {
        if (mounted) setIsLoadingAddresses(false)
      })

    return () => {
      mounted = false
    }
  }, [selectedId, shouldLoadAddresses])

  async function acceptBid(bidId: string) {
    if (!selected) return
    if (!selectedAddressId) {
      setError("Select a delivery address before creating an order")
      return
    }
    setAccepting(bidId)
    setError("")
    try {
      const response = await authenticatedFetch(
        withBasePath(`/api/rfqs/${selected.id}/bids/${bidId}/accept`),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ addressId: selectedAddressId }),
        },
      )
      const payload = await readApiResponse<{
        ok: boolean
        order?: NonNullable<UserRfq["order"]>
        message?: string
      }>(response, "Unable to accept quote")
      if (!payload.order) {
        throw new Error(payload.message || "Unable to accept quote")
      }
      onAccepted(selected.id, bidId, payload.order)
      setConfirmBidId(null)
      setSelectedAddressId("")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to accept quote")
    } finally {
      setAccepting(null)
    }
  }

  const renderAddressSelector = (inputId: string) => (
    <div className="space-y-2 rounded-sm border border-border bg-brand-surface p-4 text-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor={inputId} className="font-medium text-foreground">
          Delivery address
        </label>
        <Link
          href={withBasePath(appRoutes.settings)}
          className="text-xs font-medium text-primary hover:text-brand-primary-hover"
        >
          Manage addresses
        </Link>
      </div>
      {isLoadingAddresses ? (
        <p className="text-brand-muted">Loading saved addresses...</p>
      ) : addresses.length ? (
        <>
          <select
            id={inputId}
            value={selectedAddressId}
            onChange={(event) => setSelectedAddressId(event.target.value)}
            className="h-11 w-full rounded-sm border border-border bg-background px-3 text-foreground outline-none focus-visible:border-primary"
          >
            <option value="">Select delivery address</option>
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {addressOptionLabel(address)}
              </option>
            ))}
          </select>
          {selectedAddress ? (
            <p className="break-words text-xs leading-5 text-brand-muted">
              {addressSummary(selectedAddress)}
            </p>
          ) : null}
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-brand-muted">
            Add a saved delivery address before creating an order.
          </p>
          <Link href={withBasePath(appRoutes.settings)}>
            <Button type="button" variant="outline">
              Add address in Settings
            </Button>
          </Link>
        </div>
      )}
    </div>
  )

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
                        onClick={() => openRfq(rfq)}
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

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null)
            setConfirmBidId(null)
            setAddresses([])
            setSelectedAddressId("")
            setIsLoadingAddresses(false)
            setError("")
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] sm:p-6 xl:max-w-7xl">
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

              {!selected.order && selected.status === "open"
                ? renderAddressSelector("user-rfq-order-address")
                : null}

              <div>
                <h3 className="mb-3 font-semibold text-foreground">
                  Supplier quotations ({selected.bids.length})
                </h3>
                {selected.bids.length === 0 ? (
                  <p className="rounded-sm border border-border p-5 text-brand-muted">
                    No supplier quotations received yet. A quotation will appear here after a supplier enters an AED price for every requested part and submits the complete quote.
                  </p>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
                    {selected.bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="min-w-0 space-y-4 rounded-sm border border-border bg-brand-surface p-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                              disabled={Boolean(accepting) || bid.items.length !== selected.parts.length}
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
                        {bid.items.length === selected.parts.length ? (
                          <div className="max-w-full overflow-x-auto rounded-sm border border-border">
                            <table className="w-full min-w-[560px] text-sm">
                              <thead className="bg-background text-brand-muted"><tr><th className="p-3 text-left">Quoted part</th><th className="p-3 text-left">Qty</th><th className="p-3 text-left">Condition</th><th className="p-3 text-right">Unit (AED)</th><th className="p-3 text-right">Line total (AED)</th></tr></thead>
                              <tbody>{selected.parts.map((part) => { const item = bid.items.find((entry) => entry.rfqPartId === part.id)!; return <tr key={part.id} className="border-t border-border"><td className="p-3">{part.partName}{part.partNumber ? ` (${part.partNumber})` : ""}</td><td className="p-3">{part.quantity}</td><td className="p-3">{item.partType}</td><td className="p-3 text-right">{money(item.unitPrice)}</td><td className="p-3 text-right font-medium">{money(item.lineTotal)}</td></tr> })}</tbody>
                            </table>
                          </div>
                        ) : <p className="text-sm text-destructive">This supplier must update the quote with a price for every part before it can be accepted.</p>}
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
        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100vw-3rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Accept supplier quotation?</DialogTitle>
            <DialogDescription>
              This creates an order and rejects all other submitted quotes for{" "}
              {selected?.publicId}.
            </DialogDescription>
          </DialogHeader>
          {confirmBid ? (
            <div className="space-y-4">
              <div className="space-y-3 rounded-sm border border-border bg-brand-surface p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Supplier</span>
                  <span className="text-right font-medium">{supplierName(confirmBid)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Total quote</span>
                  <strong>{money(confirmBid.totalAmount)}</strong>
                </div>
                {selected?.parts.map((part) => { const item = confirmBid.items.find((entry) => entry.rfqPartId === part.id); return item ? <div key={part.id} className="border-t border-border pt-3"><div className="flex justify-between gap-4"><span>{part.partName} × {part.quantity}</span><strong>{money(item.lineTotal)}</strong></div><p className="mt-1 text-xs text-brand-muted">{item.partType} · {money(item.unitPrice)} each</p></div> : null })}
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Delivery</span>
                  <span>{confirmBid.deliveryDays} days</span>
                </div>
              </div>
              {renderAddressSelector("user-confirm-order-address")}
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter className="sticky bottom-0 -mx-6 -mb-6 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
            <Button
              variant="outline"
              disabled={Boolean(accepting)}
              onClick={() => setConfirmBidId(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={!confirmBid || Boolean(accepting) || !selectedAddressId}
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
