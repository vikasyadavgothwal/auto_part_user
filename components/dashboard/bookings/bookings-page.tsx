import Link from "next/link"
import { Plus } from "lucide-react"

import { BookingStats } from "@/components/dashboard/bookings/booking-stats"
import { BookingSummaryCards } from "@/components/dashboard/bookings/booking-summary-cards"
import {
  bookingStats,
  bookings,
  nextAppointment,
  popularServices,
} from "@/components/dashboard/bookings/bookings-data"
import { BookingsTable } from "@/components/dashboard/bookings/bookings-table"
import type { Booking } from "@/components/dashboard/bookings/bookings-table"
import { Button } from "@/components/ui/button"

type BookingsPageProps = {
  bookingRows?: Booking[]
  stats?: typeof bookingStats
  next?: typeof nextAppointment
  services?: string[]
}

export function BookingsPage({
  bookingRows = bookings,
  stats = bookingStats,
  next = nextAppointment,
  services = popularServices,
}: BookingsPageProps) {
  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            My Bookings
          </h1>
          <p className="text-brand-muted">Manage your service appointments.</p>
        </div>

        <Button
          asChild
          className="h-auto w-full gap-2 rounded-sm bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Link href="/services">
            <Plus className="h-5 w-5" />
            Book Service
          </Link>
        </Button>
      </div>

      <BookingStats stats={stats} />
      <BookingsTable bookings={bookingRows} />
      <BookingSummaryCards
        nextAppointment={next}
        popularServices={services}
      />
    </div>
  )
}
