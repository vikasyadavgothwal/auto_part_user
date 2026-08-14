"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { readApiResponse } from "@/lib/api-response"
import { authenticatedFetch } from "@/lib/auth/client"
import { withBasePath } from "@/lib/routes"

type ExportOrder = {
  publicId: string
  source: "rfq" | "direct"
  totalAmount: number
  status: string
  createdAt: string
  deliveryRecipientName: string | null
  deliveryPhone: string | null
  deliveryAddressLine1: string | null
  deliveryAddressLine2: string | null
  deliveryLandmark: string | null
  deliveryCity: string | null
  deliveryState: string | null
  deliveryPostalCode: string | null
  deliveryCountry: string | null
  supplier: {
    companyName: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
  }
  items: Array<{
    partName: string
    partNumber: string | null
    quantity: number
    lineTotal: number | null
  }>
  rfq: {
    publicId: string
    vehicleVin: string | null
    vehicleYear: number | null
    vehicleMake: string | null
    vehicleModel: string | null
    vehicleTrim: string | null
  } | null
}

type OrdersExportPayload = {
  ok: boolean
  orders?: ExportOrder[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  message?: string
}

const exportPageSize = 50

const supplierName = (order: ExportOrder) =>
  order.supplier.companyName ||
  [order.supplier.firstName, order.supplier.lastName].filter(Boolean).join(" ") ||
  order.supplier.email ||
  "Supplier"

const partSummary = (order: ExportOrder) => {
  const firstPart = order.items[0]?.partName
  if (!firstPart) return order.source === "rfq" ? "RFQ order" : "Parts order"
  if (order.items.length === 1) return firstPart
  return `${firstPart} + ${order.items.length - 1} more`
}

const vehicleSummary = (order: ExportOrder) => {
  if (!order.rfq) return "Direct cart order"
  return (
    [
      order.rfq.vehicleYear,
      order.rfq.vehicleMake,
      order.rfq.vehicleModel,
      order.rfq.vehicleTrim,
    ]
      .filter(Boolean)
      .join(" ") ||
    order.rfq.vehicleVin ||
    order.rfq.publicId
  )
}

const deliveryAddress = (order: ExportOrder) =>
  [
    order.deliveryRecipientName,
    order.deliveryPhone,
    order.deliveryAddressLine1,
    order.deliveryAddressLine2,
    order.deliveryLandmark,
    order.deliveryCity,
    order.deliveryState,
    order.deliveryPostalCode,
    order.deliveryCountry,
  ]
    .filter(Boolean)
    .join(", ")

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10)
}

const formatMoney = (amount: number) => amount.toFixed(2)

const csvCell = (value: string | number | null | undefined) => {
  const raw = String(value ?? "")
  const protectedValue = /^[=+\-@]/.test(raw) ? `'${raw}` : raw
  return `"${protectedValue.replace(/"/g, '""')}"`
}

const downloadCsv = (orders: ExportOrder[]) => {
  const header = [
    "Order ID",
    "Date",
    "Status",
    "Order Type",
    "Supplier",
    "Vehicle",
    "Parts",
    "Total Quantity",
    "Total AED",
    "Delivery Address",
  ]
  const rows = orders.map((order) => [
    order.publicId,
    formatDate(order.createdAt),
    order.status,
    order.source === "direct" ? "Cart order" : "RFQ order",
    supplierName(order),
    vehicleSummary(order),
    partSummary(order),
    order.items.reduce((total, item) => total + item.quantity, 0),
    formatMoney(order.totalAmount),
    deliveryAddress(order),
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((value) => csvCell(value)).join(","))
    .join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function ExportOrdersButton() {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)

    try {
      const orders: ExportOrder[] = []
      let page = 1
      let totalPages = 1

      do {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(exportPageSize),
        })
        const response = await authenticatedFetch(
          withBasePath(`/api/orders?${params}`),
        )
        const payload = await readApiResponse<OrdersExportPayload>(
          response,
          "Unable to export orders",
        )
        orders.push(...(payload.orders ?? []))
        totalPages = payload.pagination?.totalPages ?? page
        page += 1
      } while (page <= totalPages)

      if (!orders.length) {
        throw new Error("No orders are available to export.")
      }

      downloadCsv(orders)
      toast.success("Orders exported successfully")
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to export orders")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-2 sm:text-right">
      <Button
        type="button"
        variant="outline"
        disabled={isExporting}
        onClick={() => void handleExport()}
        className="h-auto w-full gap-2 rounded-sm border-border bg-brand-panel-strong px-6 py-3 text-foreground hover:border-primary hover:bg-brand-panel-strong sm:w-auto"
      >
        <Download className="h-5 w-5" />
        {isExporting ? "Exporting..." : "Export Orders"}
      </Button>
    </div>
  )
}
