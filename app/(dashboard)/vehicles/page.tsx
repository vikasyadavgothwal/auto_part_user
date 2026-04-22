"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pen, Plus, Trash2, Truck } from "lucide-react"

import { VehicleForm } from "@/components/vehicle-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { appRoutes } from "@/lib/routes"
import {
  formatVehicleMileage,
  getDefaultVehicles,
  getVehicleDisplayName,
  readVehiclesFromStorage,
  removeVehicle,
  toVehicleFormValues,
  type VehicleRecord,
  type VehicleStatus,
  upsertVehicle,
  writeVehiclesToStorage,
} from "@/lib/vehicles"

const vehicleStatusClasses: Record<VehicleStatus, string> = {
  Active:
    "rounded-full border border-brand-success/20 bg-brand-success/10 px-3 py-1 text-xs font-medium text-brand-success hover:bg-brand-success/10",
  "In Service":
    "rounded-full border border-brand-warning/20 bg-brand-warning/10 px-3 py-1 text-xs font-medium text-brand-warning hover:bg-brand-warning/10",
  Inactive:
    "rounded-full border border-border bg-brand-panel-strong px-3 py-1 text-xs font-medium text-brand-muted hover:bg-brand-panel-strong",
}

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(getDefaultVehicles)
  const [editVehicle, setEditVehicle] = useState<VehicleRecord | null>(null)

  useEffect(() => {
    setVehicles(readVehiclesFromStorage())
  }, [])

  function persistVehicles(nextVehicles: VehicleRecord[]) {
    setVehicles(nextVehicles)
    writeVehiclesToStorage(nextVehicles)
  }

  const totalVehicles = vehicles.length
  const primaryVehicle = vehicles.find((vehicle) => vehicle.primary) ?? null
  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Active"
  ).length

  const stats = [
    {
      title: "Total Vehicles",
      value: String(totalVehicles),
      subtitle:
        totalVehicles === 1 ? "Vehicle in workspace" : "Vehicles in workspace",
    },
    {
      title: "Primary Vehicle",
      value: primaryVehicle ? primaryVehicle.year : "Not set",
      subtitle: primaryVehicle
        ? `${primaryVehicle.make} ${primaryVehicle.model}`
        : "Choose a default vehicle",
    },
    {
      title: "Active Vehicles",
      value: String(activeVehicles),
      subtitle: `${totalVehicles - activeVehicles} inactive or in service`,
    },
  ]

  function handleEditVehicle(vehicle: VehicleRecord) {
    setEditVehicle(vehicle)
  }

  function handleEditSubmit(values: ReturnType<typeof toVehicleFormValues>) {
    if (!editVehicle) {
      return
    }

    persistVehicles(
      upsertVehicle(vehicles, {
        id: editVehicle.id,
        ...values,
      })
    )
    setEditVehicle(null)
  }

  function handleDeleteVehicle(vehicleId: string) {
    const vehicleToDelete = vehicles.find((vehicle) => vehicle.id === vehicleId)

    if (!vehicleToDelete) {
      return
    }

    const confirmed = window.confirm(
      `Remove ${getVehicleDisplayName(vehicleToDelete)} from your vehicles?`
    )

    if (!confirmed) {
      return
    }

    persistVehicles(removeVehicle(vehicles, vehicleId))

    if (editVehicle?.id === vehicleId) {
      setEditVehicle(null)
    }
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              My Vehicles
            </h1>
            <p className="text-brand-muted">
              Add vehicles once, then edit each one from its own action.
            </p>
          </div>

          <Button
            asChild
            className="h-auto w-full gap-2 rounded-sm bg-primary px-6 py-3 text-primary-foreground hover:bg-brand-primary-hover sm:w-auto"
          >
            <Link href={appRoutes.createVehicle}>
              <Plus className="h-5 w-5" />
              Add Vehicle
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((item) => (
            <Card
              key={item.title}
              className="rounded-sm border border-border bg-brand-panel"
            >
              <CardContent className="p-6">
                <div className="mb-2 text-sm text-brand-muted">{item.title}</div>
                <div className="text-3xl font-bold text-foreground">
                  {item.value}
                </div>
                <div className="mt-1 text-sm text-brand-muted">
                  {item.subtitle}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden rounded-sm border border-border bg-brand-panel">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-brand-surface hover:bg-brand-surface">
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Vehicle
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    VIN
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Mileage
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-brand-muted">
                    Actions
                  </TableHead>
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
                            onClick={() => handleEditVehicle(vehicle)}
                            className="rounded bg-brand-panel-strong p-2 text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                            aria-label={`Edit ${getVehicleDisplayName(vehicle)}`}
                          >
                            <Pen className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
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

        <Card className="rounded-sm border border-border bg-brand-panel">
          <CardContent className="p-6">
            <h3 className="mb-2 font-semibold text-foreground">
              Why add vehicles?
            </h3>
            <p className="mb-4 text-sm text-brand-muted">
              Adding your vehicles keeps fitment, pricing, and service tracking
              aligned with the exact unit you&apos;re managing.
            </p>

            <ul className="space-y-2 text-sm text-brand-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Open the edit dialog from any vehicle row</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Update mileage, VIN, status, or primary assignment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Save changes only to the selected vehicle</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(editVehicle)}
        onOpenChange={(open) => {
          if (!open) {
            setEditVehicle(null)
          }
        }}
      >
        <DialogContent className="max-w-[calc(100%-2rem)] border border-border bg-brand-panel p-0 text-foreground sm:max-w-2xl">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Changes are applied only to the vehicle you selected.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <VehicleForm
              initialValues={toVehicleFormValues(editVehicle ?? undefined)}
              submitLabel="Save Changes"
              onSubmit={handleEditSubmit}
              onCancel={() => setEditVehicle(null)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
