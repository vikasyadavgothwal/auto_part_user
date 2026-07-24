import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mainWebsiteUrl } from "@/lib/main-website-url"

type Appointment = {
  service: string
  dateTime: string
  garage: string
}

type BookingSummaryCardsProps = {
  nextAppointment: Appointment
  popularServices: string[]
}

export function BookingSummaryCards({
  nextAppointment,
  popularServices,
}: BookingSummaryCardsProps) {
  const servicesUrl = `${mainWebsiteUrl()}/services`

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="rounded-sm border border-border bg-brand-panel">
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold text-foreground">
            Next Appointment
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-brand-muted">Service:</span>
              <span className="font-medium text-foreground">
                {nextAppointment.service}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-brand-muted">Date &amp; Time:</span>
              <span className="font-medium text-foreground">
                {nextAppointment.dateTime}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-brand-muted">Garage:</span>
              <span className="font-medium text-foreground">
                {nextAppointment.garage}
              </span>
            </div>
          </div>

          <Button className="mt-4 w-full rounded-sm bg-brand-panel-strong text-foreground hover:bg-primary">
            View Details
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-sm border border-border bg-brand-panel">
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold text-foreground">
            Popular Services
          </h3>

          <div className="space-y-3">
            {popularServices.map((service) => (
              <Link
                key={service}
                href={servicesUrl}
                className="flex items-center justify-between rounded-sm bg-brand-surface p-3 transition-all hover:border hover:border-primary"
              >
                <span className="text-sm text-foreground">{service}</span>
                <span className="text-xs text-primary">Book Now →</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
