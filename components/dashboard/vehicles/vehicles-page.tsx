/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { EditVehicleDialog } from "@/components/dashboard/vehicles/edit-vehicle-dialog"
import { VehicleStats } from "@/components/dashboard/vehicles/vehicle-stats"
import { VehiclesInfoCard } from "@/components/dashboard/vehicles/vehicles-info-card"
import { VehiclesTable } from "@/components/dashboard/vehicles/vehicles-table"
import { Button } from "@/components/ui/button"
import { appRoutes } from "@/lib/routes"
import {
  getDefaultVehicles,
  getVehicleDisplayName,
  readVehiclesFromStorage,
  removeVehicle,
  type VehicleFormValues,
  type VehicleRecord,
  upsertVehicle,
  writeVehiclesToStorage,
} from "@/lib/vehicles"

export function VehiclesPage() {
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
  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Active"
  ).length

  const stats = [
    {
      id: 1,
      title: "Total Vehicles",
      value: String(totalVehicles),
    },
    {
      id: 2,
      title: "Recent Orders",
      value: 12,
      subtitle: "Across all veicle",
    },
    {
      id: 3,
      title: "Active RFQs",
      value: String(activeVehicles),
      subtitle: "Find your veicles",
    },
  ]

  function handleEditVehicle(vehicle: VehicleRecord) {
    setEditVehicle(vehicle)
  }

  function handleEditSubmit(values: VehicleFormValues) {
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
    const vehicleToDelete = vehicles.find(
      (vehicle) => vehicle.id === vehicleId
    )
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

        <VehicleStats stats={stats} />
        <VehiclesTable
          vehicles={vehicles}
          onEditVehicle={handleEditVehicle}
          onDeleteVehicle={handleDeleteVehicle}
        />
        <VehiclesInfoCard />
      </div>

      <EditVehicleDialog
        vehicle={editVehicle}
        onOpenChange={(open) => {
          if (!open) {
            setEditVehicle(null)
          }
        }}
        onSubmit={handleEditSubmit}
        onCancel={() => setEditVehicle(null)}
      />
    </>
  )
}
