"use client"

import { useMemo, useState, useTransition } from "react"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { RequiredMark } from "@/components/ui/required-mark"

export type Booking = {
  id: string
  backendId?: string
  serviceId?: string | null
  date: string
  time: string
  garage: string
  service: string
  vehicle: string
  price: string
  status: string
  rawStatus?:
    | "pending"
    | "pending_slot_selection"
    | "confirmed"
    | "completed"
    | "cancelled"
  canSelectSlot?: boolean
  badgeClass: string
  reviewId?: string | null
  reviewRating?: number | null
  reviewComment?: string | null
  reviewGarageReply?: string | null
}

type BookingsTableProps = {
  bookings: Booking[]
}

const bookingsPageSize = 10

const tableHeaders = [
  "Booking ID",
  "Date",
  "Time",
  "Garage",
  "Service",
  "Vehicle",
  "Price",
  "Status",
  "Review",
]

export function BookingsTable({ bookings }: BookingsTableProps) {
  const router = useRouter()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(bookings.length / bookingsPageSize))
  const currentPage = Math.min(page, totalPages)
  const rangeStart = bookings.length
    ? (currentPage - 1) * bookingsPageSize + 1
    : 0
  const rangeEnd = Math.min(currentPage * bookingsPageSize, bookings.length)
  const visibleBookings = useMemo(
    () =>
      bookings.slice(
        (currentPage - 1) * bookingsPageSize,
        currentPage * bookingsPageSize,
      ),
    [bookings, currentPage],
  )

  function openReview(booking: Booking) {
    setSelectedBooking(booking)
    setRating(booking.reviewRating ?? 5)
    setComment(booking.reviewComment ?? "")
  }

  function submitReview() {
    if (!selectedBooking?.serviceId) return
    const normalizedComment = comment.trim()
    if (rating < 1 || rating > 5) {
      toast.error("Select a rating between 1 and 5 stars")
      return
    }
    if (normalizedComment.length < 3 || !/[\p{L}\p{N}]/u.test(normalizedComment)) {
      toast.error("Feedback must be at least 3 characters")
      return
    }
    const isEditing = Boolean(selectedBooking.reviewId)

    startTransition(async () => {
      try {
        const response = await authenticatedFetch(
          withBasePath("/api/garage-reviews"),
          {
            method: selectedBooking.reviewId ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: selectedBooking.backendId,
              serviceId: selectedBooking.serviceId,
              rating,
              comment: normalizedComment,
            }),
          },
        )

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null
          throw new Error(payload?.message ?? "Unable to save review")
        }

        toast.success(isEditing ? "Review updated successfully" : "Review saved successfully")
        setSelectedBooking(null)
        router.refresh()
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Unable to reach the server. Please try again.")
      }
    })
  }


  return (
    <>
      <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel py-0">
        <div className="no-scrollbar overflow-x-auto">
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
              {visibleBookings.length ? (
                visibleBookings.map((booking) => {
                const canReview =
                  booking.rawStatus === "completed" && Boolean(booking.serviceId)

                return (
                  <TableRow
                    key={booking.id}
                    className="border-b border-border transition-colors hover:bg-brand-panel-strong"
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

                    <TableCell className="px-6 py-4 text-sm text-brand-muted">
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={booking.reviewId ? "outline" : "default"}
                          disabled={!canReview}
                          onClick={() => openReview(booking)}
                        >
                          {booking.reviewId ? "Edit review" : "Review"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableHeaders.length}
                    className="px-6 py-10 text-center text-sm text-brand-muted"
                  >
                    No bookings found. Service appointments will appear here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="mt-4 flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {rangeStart}-{rangeEnd} of {bookings.length} bookings
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedBooking?.reviewId ? "Edit review" : "Review service"}
            </DialogTitle>
            <DialogDescription>
              {selectedBooking?.service} at {selectedBooking?.garage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-foreground">
                Rating<RequiredMark />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  return (
                    <button
                      key={value}
                      type="button"
                      className="rounded-sm p-1"
                      onClick={() => setRating(value)}
                      aria-label={`${value} star rating`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          value <= rating
                            ? "fill-primary text-primary"
                            : "text-border"
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Feedback<RequiredMark />
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-28 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                maxLength={1000}
                minLength={3}
                required
                placeholder="Share your service experience"
              />
            </label>

            {selectedBooking?.reviewGarageReply ? (
              <div className="rounded-sm border border-border bg-background p-3 text-sm text-brand-muted">
                <span className="font-semibold text-foreground">
                  Garage reply:
                </span>{" "}
                {selectedBooking.reviewGarageReply}
              </div>
            ) : null}

          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedBooking(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || !comment.trim()}
              onClick={submitReview}
            >
              Save review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
