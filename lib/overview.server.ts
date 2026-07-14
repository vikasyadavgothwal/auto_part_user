import { cookies } from "next/headers"

import type { UserRfq } from "@/components/dashboard/rfqs/rfqs-data"
import { requestBackend } from "@/lib/auth/backend"
import {
  getUserGarageBookings,
  type UserGarageBookingRecord,
} from "@/lib/garage-bookings.server"
import { getUserOrders, mapUserOrders } from "@/lib/orders.server"
import {
  browsePartsUrl,
  formatSavedPartPrice,
  getUserSavedParts,
  productUrl,
  type SavedPartRecord,
} from "@/lib/saved-parts.server"
import {
  formatVehicleMileage,
  getVehicleDisplayName,
  type VehicleRecord,
} from "@/lib/vehicles"

type UserVehiclesPayload = {
  ok: boolean
  vehicles?: VehicleRecord[]
}

type UserRfqsPayload = {
  ok: boolean
  rfqs?: UserRfq[]
}

export type OverviewPrimaryVehicle = {
  title: string
  vin: string
  mileage: string
  status: string
} | null

export type OverviewRecentOrder = {
  id: string
  part: string
  vehicle: string
  status: string
  statusClass: string
  date: string
  total: string
}

export type OverviewActiveRfq = {
  id: string
  part: string
  vehicle: string
  quotes: string
  status: string
  expires: string
}

export type OverviewRecommendedProduct = {
  id: string
  title: string
  subtitle: string
  price: string
  href: string
  image: string
  stockLabel: string
}

export type UserOverviewData = {
  summary: {
    activeOrders: number
    inTransitOrders: number
    activeRfqs: number
    quotesReceived: number
    upcomingBookings: number
    nextBooking: string
    savedParts: number
    savedPartsInStock: number
    vehicles: number
  }
  primaryVehicle: OverviewPrimaryVehicle
  recentOrders: OverviewRecentOrder[]
  activeRfqs: OverviewActiveRfq[]
  recommendedProducts: OverviewRecommendedProduct[]
  browsePartsHref: string
}

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

async function getUserVehicles() {
  try {
    const response = await requestBackend(
      "/api/v1/user/vehicles?page=1&pageSize=50",
      {
        cookieHeader: (await cookies()).toString(),
      },
    )
    if (!response.ok) return []

    const payload = (await response.json()) as UserVehiclesPayload
    if (!payload.ok) return []
    return payload.vehicles ?? []
  } catch {
    return []
  }
}

async function getUserRfqs() {
  try {
    const response = await requestBackend("/api/v1/rfqs?page=1&pageSize=50", {
      cookieHeader: (await cookies()).toString(),
    })
    if (!response.ok) return []

    const payload = (await response.json()) as UserRfqsPayload
    if (!payload.ok) return []
    return payload.rfqs ?? []
  } catch {
    return []
  }
}

async function getGarageBookingsSafely() {
  try {
    return await getUserGarageBookings()
  } catch {
    return []
  }
}

function buildPrimaryVehicle(vehicles: VehicleRecord[]): OverviewPrimaryVehicle {
  const vehicle = vehicles.find((item) => item.primary) ?? vehicles[0]
  if (!vehicle) return null

  return {
    title: getVehicleDisplayName(vehicle) || "Vehicle",
    vin: vehicle.vin || "Not added",
    mileage: formatVehicleMileage(vehicle.mileage),
    status: vehicle.status,
  }
}

function buildRecentOrders(
  ordersData: Awaited<ReturnType<typeof getUserOrders>>,
) {
  return mapUserOrders(ordersData.orders)
    .slice(0, 5)
    .map((order) => ({
      id: order.id,
      part: order.part,
      vehicle: order.vehicle,
      status: order.status,
      statusClass: order.badgeClass,
      date: order.date,
      total: order.total,
    }))
}

function partSummary(rfq: UserRfq) {
  const firstPart = rfq.parts[0]?.partName
  if (!firstPart) return rfq.projectName || "Parts request"
  if (rfq.parts.length === 1) return firstPart
  return `${firstPart} + ${rfq.parts.length - 1} more`
}

function vehicleSummary(rfq: UserRfq) {
  return (
    [
      rfq.vehicleYear,
      rfq.vehicleMake,
      rfq.vehicleModel,
      rfq.vehicleTrim,
    ]
      .filter(Boolean)
      .join(" ") ||
    rfq.vehicleVin ||
    "Vehicle not added"
  )
}

function formatDeadline(value: string) {
  const deadline = new Date(value)
  if (Number.isNaN(deadline.getTime())) return "No deadline"

  const currentDay = new Date()
  currentDay.setHours(0, 0, 0, 0)
  const deadlineDay = new Date(deadline)
  deadlineDay.setHours(0, 0, 0, 0)

  const days = Math.ceil(
    (deadlineDay.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (days < 0) return "Expired"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  return `${days} days`
}

function buildActiveRfqs(rfqs: UserRfq[]) {
  return rfqs
    .filter((rfq) => rfq.status === "open")
    .slice(0, 5)
    .map((rfq) => ({
      id: rfq.publicId,
      part: partSummary(rfq),
      vehicle: vehicleSummary(rfq),
      quotes: `${rfq.bids.length} received`,
      status: "Active",
      expires: formatDeadline(rfq.responseDeadline),
    }))
}

function bookingSortValue(booking: UserGarageBookingRecord) {
  const time = booking.bookingTime || "00:00"
  const value = new Date(`${booking.bookingDate}T${time}`).getTime()
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value
}

function formatBookingDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return shortDateFormatter.format(date)
}

function buildNextBookingLabel(bookings: UserGarageBookingRecord[]) {
  const nextBooking = bookings
    .filter(
      (booking) =>
        booking.status === "pending" || booking.status === "confirmed",
    )
    .sort((current, next) => bookingSortValue(current) - bookingSortValue(next))[0]

  if (!nextBooking) return "No upcoming service"
  return `${nextBooking.serviceName} on ${formatBookingDate(
    nextBooking.bookingDate,
  )}`
}

function savedPartSubtitle(part: SavedPartRecord) {
  return (
    [
      part.brandName,
      part.category,
      part.partNumber ? `Part # ${part.partNumber}` : "",
    ]
      .filter(Boolean)
      .join(" | ") || `${part.offerCount} verified offers`
  )
}

function buildRecommendedProducts(parts: SavedPartRecord[]) {
  return parts.slice(0, 3).map((part) => ({
    id: part.partUid,
    title: part.title,
    subtitle: savedPartSubtitle(part),
    price: formatSavedPartPrice(part),
    href: productUrl(part.partUid),
    image: part.image || part.images[0] || "",
    stockLabel:
      part.totalStock > 0 ? `${part.totalStock} in stock` : "Out of stock",
  }))
}

export async function getUserOverviewData(): Promise<UserOverviewData> {
  const [ordersData, bookings, savedParts, vehicles, rfqs] = await Promise.all([
    getUserOrders(),
    getGarageBookingsSafely(),
    getUserSavedParts(),
    getUserVehicles(),
    getUserRfqs(),
  ])

  const activeOrderStatuses = ordersData.summary.byStatus
  const activeOrders =
    (activeOrderStatuses.pending ?? 0) +
    (activeOrderStatuses.confirmed ?? 0) +
    (activeOrderStatuses.processing ?? 0) +
    (activeOrderStatuses.shipped ?? 0)
  const openRfqs = rfqs.filter((rfq) => rfq.status === "open")
  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed",
  )

  return {
    summary: {
      activeOrders,
      inTransitOrders: activeOrderStatuses.shipped ?? 0,
      activeRfqs: openRfqs.length,
      quotesReceived: openRfqs.reduce((total, rfq) => total + rfq.bids.length, 0),
      upcomingBookings: upcomingBookings.length,
      nextBooking: buildNextBookingLabel(bookings),
      savedParts: savedParts.length,
      savedPartsInStock: savedParts.filter((part) => part.totalStock > 0).length,
      vehicles: vehicles.length,
    },
    primaryVehicle: buildPrimaryVehicle(vehicles),
    recentOrders: buildRecentOrders(ordersData),
    activeRfqs: buildActiveRfqs(rfqs),
    recommendedProducts: buildRecommendedProducts(savedParts),
    browsePartsHref: browsePartsUrl(),
  }
}
