import Link from "next/link"
import { Search, Truck, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type PrimaryVehicle = {
  title: string
  vin: string
}

type PrimaryVehicleCardProps = {
  vehicle: PrimaryVehicle
}

export function PrimaryVehicleCard({ vehicle }: PrimaryVehicleCardProps) {
  return (
    <Card className="rounded-sm border border-border bg-brand-panel">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="mb-1 text-xl font-bold text-foreground">
              My Vehicle
            </h2>
            <p className="text-sm text-brand-muted">
              Primary vehicle for parts search
            </p>
          </div>

          <Link
            href="/dashboard/buyer/vehicles"
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
              {vehicle.title}
            </h3>
            <p className="text-sm text-brand-muted">VIN: {vehicle.vin}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button
            asChild
            className="h-auto rounded-sm bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover"
          >
            <Link href="/search" className="flex items-center justify-center gap-2">
              <Search className="h-5 w-5" />
              Search Parts
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto rounded-sm border-border bg-brand-panel-strong px-6 py-3 text-foreground hover:border-primary hover:bg-brand-panel-strong"
          >
            <Link
              href="/services"
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
