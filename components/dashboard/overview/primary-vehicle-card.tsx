import Link from "next/link"
import { Search, Truck, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { appRoutes } from "@/lib/routes"

type PrimaryVehicle = {
  title: string
  vin: string
  mileage: string
  status: string
}

type PrimaryVehicleCardProps = {
  vehicle: PrimaryVehicle | null
  vehicleCount: number
}

export function PrimaryVehicleCard({
  vehicle,
  vehicleCount,
}: PrimaryVehicleCardProps) {
  return (
    <Card className="rounded-sm border border-border bg-brand-panel">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="mb-1 text-xl font-bold text-foreground">
              My Vehicle
            </h2>
            <p className="text-sm text-brand-muted">
              {vehicleCount
                ? `${vehicleCount} saved vehicle${vehicleCount === 1 ? "" : "s"}`
                : "Add a vehicle to personalize parts and RFQs"}
            </p>
          </div>

          <Link
            href={appRoutes.vehicles}
            className="text-sm font-medium text-primary transition-colors hover:text-brand-primary-hover"
          >
            Manage Vehicles
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="w-fit rounded-sm border border-primary/20 bg-primary/10 p-4">
            <Truck className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h3 className="mb-1 text-2xl font-bold text-foreground">
              {vehicle?.title ?? "No vehicle added yet"}
            </h3>
            <p className="text-sm text-brand-muted">
              VIN: {vehicle?.vin ?? "Not added"}
            </p>
            {vehicle ? (
              <p className="mt-1 text-sm text-brand-muted">
                {vehicle.mileage} | {vehicle.status}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button
            asChild
            className="h-auto rounded-sm bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover"
          >
            <Link
              href={vehicle ? appRoutes.createRfq : appRoutes.createVehicle}
              className="flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              {vehicle ? "Request Parts" : "Add Vehicle"}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto rounded-sm border-border bg-brand-panel-strong px-6 py-3 text-foreground hover:border-primary hover:bg-brand-panel-strong"
          >
            <Link
              href={appRoutes.bookings}
              className="flex items-center justify-center gap-2"
            >
              <Wrench className="h-5 w-5" />
              Book Service
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
