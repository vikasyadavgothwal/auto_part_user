import { Pen, Trash2, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatVehicleMileage,
  getVehicleDisplayName,
  type VehicleRecord,
} from "@/lib/vehicles"
import { vehicleStatusClasses } from "@/components/dashboard/vehicles/vehicle-status"

type VehiclesTableProps = {
  vehicles: VehicleRecord[]
  onEditVehicle: (vehicle: VehicleRecord) => void
  onDeleteVehicle: (vehicleId: string) => void
}

const tableHeaders = ["Vehicle", "VIN", "Mileage", "Status", "Actions"]

export function VehiclesTable({
  vehicles,
  onEditVehicle,
  onDeleteVehicle,
}: VehiclesTableProps) {
  return (
    <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel py-0">
      <div className="overflow-x-auto">
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
            {vehicles.length ? (
              vehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className="border-b border-border transition-colors hover:bg-brand-panel-strong"
                >
                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <div className="flex items-center gap-3">
                      <div className="rounded-sm border border-primary/20 bg-primary/10 p-2">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <div className="font-semibold text-foreground">
                          {getVehicleDisplayName(vehicle)}
                        </div>
                        {vehicle.primary ? (
                          <span className="text-xs text-primary">
                            Primary Vehicle
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    {vehicle.vin}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    {formatVehicleMileage(vehicle.mileage)}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <Badge className={vehicleStatusClasses[vehicle.status]}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-brand-muted">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditVehicle(vehicle)}
                        className="rounded bg-brand-panel-strong p-2 text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                        aria-label={`Edit ${getVehicleDisplayName(vehicle)}`}
                      >
                        <Pen className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteVehicle(vehicle.id)}
                        className="rounded bg-brand-panel-strong p-2 text-foreground transition-all hover:bg-destructive hover:text-primary-foreground"
                        aria-label={`Delete ${getVehicleDisplayName(vehicle)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-brand-muted"
                >
                  No vehicles added yet. Create one to start tracking fitment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
