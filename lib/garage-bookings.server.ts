import { cookies } from "next/headers"

import type { Booking } from "@/components/dashboard/bookings/bookings-table"
import { requestBackend } from "@/lib/auth/backend"

type GarageBookingStatus =
  | "pending"
  | "pending_slot_selection"
  | "confirmed"
  | "completed"
  | "cancelled"

export type UserGarageBookingRecord = {
  id: string
  publicId: string
  garageId: string
  customerId: string | null
  serviceId: string | null
  serviceName: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  vehicleYear: string | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleVin: string | null
  notes: string | null
  bookingDate: string | null
  bookingTime: string | null
  durationMinutes: number
  price: number
  currency: string
  status: GarageBookingStatus
  linkedOrderId: string | null
  canSelectSlot?: boolean
  garageName: string | null
  reviewId: string | null
  reviewRating: number | null
  reviewComment: string | null
  reviewGarageReply: string | null
  createdAt: string
  updatedAt: string
}

type UserGarageBookingsPayload = {
  ok: boolean
  bookings?: UserGarageBookingRecord[]
  message?: string
}

const formatDate = (value: string | null) =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select after delivery"

const formatScheduledDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const formatVehicle = (booking: UserGarageBookingRecord) =>
  [booking.vehicleYear, booking.vehicleMake, booking.vehicleModel]
    .filter(Boolean)
    .join(" ") || "Vehicle not added"

const formatMoney = (amount: number, currency: string) =>
  `${currency} ${(amount / 100).toFixed(2)}`

const statusLabel = (status: GarageBookingStatus) =>
  status === "pending_slot_selection"
    ? "Awaiting slot selection"
    : status.slice(0, 1).toUpperCase() + status.slice(1)

const badgeClass = (status: GarageBookingStatus) => {
  if (status === "completed") {
    return "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10"
  }
  if (status === "cancelled") {
    return "border-primary/20 bg-primary/10 text-primary hover:bg-primary/10"
  }
  if (status === "pending_slot_selection") {
    return "border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10"
  }
  return "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10"
}

export async function getUserGarageBookings() {
  const response = await requestBackend("/api/v1/user/garage-bookings", {
    cookieHeader: (await cookies()).toString(),
  })

  if (!response.ok) {
    return []
  }

  const payload = (await response.json()) as UserGarageBookingsPayload
  return payload.bookings ?? []
}

export function mapUserGarageBookings(bookings: UserGarageBookingRecord[]) {
  return bookings.map(
    (booking): Booking => ({
      id: booking.publicId,
      backendId: booking.id,
      serviceId: booking.serviceId,
      date: formatDate(booking.bookingDate),
      time: booking.bookingTime ?? "Select after delivery",
      garage: booking.garageName || "Garage",
      service: booking.serviceName,
      vehicle: formatVehicle(booking),
      price: formatMoney(booking.price, booking.currency),
      status: statusLabel(booking.status),
      rawStatus: booking.status,
      canSelectSlot: Boolean(booking.canSelectSlot),
      badgeClass: badgeClass(booking.status),
      reviewId: booking.reviewId,
      reviewRating: booking.reviewRating,
      reviewComment: booking.reviewComment,
      reviewGarageReply: booking.reviewGarageReply,
    }),
  )
}

export function buildUserBookingStats(bookings: UserGarageBookingRecord[]) {
  const upcoming = bookings.filter(
    (booking) =>
      booking.status === "pending" ||
      booking.status === "pending_slot_selection" ||
      booking.status === "confirmed",
  )
  const completed = bookings.filter((booking) => booking.status === "completed")
  const spent = bookings.reduce((total, booking) => total + booking.price, 0)

  return [
    { title: "Upcoming", value: String(upcoming.length) },
    { title: "Completed", value: String(completed.length) },
    { title: "Total Spent", value: formatMoney(spent, "AED") },
  ]
}

export function buildNextAppointment(bookings: UserGarageBookingRecord[]) {
  const upcoming = bookings.find(
    (booking) =>
      booking.status === "pending" ||
      booking.status === "pending_slot_selection" ||
      booking.status === "confirmed",
  )

  if (!upcoming) {
    return {
      service: "No upcoming service",
      dateTime: "Not scheduled",
      garage: "Book a service to see it here",
    }
  }

  return {
    service: upcoming.serviceName,
    dateTime: upcoming.bookingDate && upcoming.bookingTime
      ? `${formatScheduledDate(upcoming.bookingDate)}, ${upcoming.bookingTime}`
      : "Slot selection after part delivery",
    garage: upcoming.garageName || "Garage",
  }
}

export function buildPopularServices(bookings: UserGarageBookingRecord[]) {
  const services = Array.from(new Set(bookings.map((booking) => booking.serviceName)))
  return services.length ? services.slice(0, 4) : ["Oil Change", "Brake Service", "Tire Rotation"]
}
