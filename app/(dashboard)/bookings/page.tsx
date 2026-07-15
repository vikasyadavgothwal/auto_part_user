import { BookingsPage } from "@/components/dashboard/bookings/bookings-page"
import {
  buildNextAppointment,
  buildPopularServices,
  buildUserBookingStats,
  getUserGarageBookings,
  mapUserGarageBookings,
} from "@/lib/garage-bookings.server"

export const dynamic = "force-dynamic"

export default async function MyBookingsPage() {
  const bookings = await getUserGarageBookings()

  return (
    <BookingsPage
      bookingRows={mapUserGarageBookings(bookings)}
      stats={buildUserBookingStats(bookings)}
      next={buildNextAppointment(bookings)}
      services={buildPopularServices(bookings)}
    />
  )
}
