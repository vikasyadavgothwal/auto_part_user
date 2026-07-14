"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { EditVehicleDialog } from "@/components/dashboard/vehicles/edit-vehicle-dialog"
import { VehicleStats } from "@/components/dashboard/vehicles/vehicle-stats"
import { VehiclesInfoCard } from "@/components/dashboard/vehicles/vehicles-info-card"
import { VehiclesTable } from "@/components/dashboard/vehicles/vehicles-table"
import { Button } from "@/components/ui/button"
import { authenticatedFetch } from "@/lib/auth/client"
import { appRoutes, withBasePath } from "@/lib/routes"
import {
  getVehicleDisplayName,
  readVehiclesFromStorage,
  type VehicleFormValues,
  type VehicleRecord,
} from "@/lib/vehicles"

type VehiclesApiResponse = {
  ok: boolean
  vehicles?: VehicleRecord[]
  vehicle?: VehicleRecord
  message?: string
}

const vehiclePayload = (values: VehicleFormValues) => ({
  year: values.year,
  make: values.make,
  model: values.model,
  vin: values.vin,
  mileage: values.mileage,
  status: values.status,
  primary: values.primary,
})

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [editVehicle, setEditVehicle] = useState<VehicleRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void loadVehicles()
  }, [])

  async function loadVehicles() {
    setIsLoading(true)
    setError("")
    try {
      const response = await authenticatedFetch(
        withBasePath("/api/vehicles?page=1&pageSize=50"),
      )
      const payload = (await response.json()) as VehiclesApiResponse
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Unable to load vehicles")
      }

      let nextVehicles = payload.vehicles ?? []
      if (!nextVehicles.length) {
        const localVehicles = readVehiclesFromStorage({ includeDefaults: false })
        if (localVehicles.length) {
          await Promise.all(
            localVehicles.map((vehicle) =>
              authenticatedFetch(withBasePath("/api/vehicles"), {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(vehiclePayload(vehicle)),
              }),
            ),
          )
          const migratedResponse = await authenticatedFetch(
            withBasePath("/api/vehicles?page=1&pageSize=50"),
          )
          const migratedPayload = (await migratedResponse.json()) as VehiclesApiResponse
          if (migratedResponse.ok && migratedPayload.ok) {
            nextVehicles = migratedPayload.vehicles ?? []
          }
        }
      }
      setVehicles(nextVehicles)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load vehicles")
    } finally {
      setIsLoading(false)
    }
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

  async function handleEditSubmit(values: VehicleFormValues) {
    if (!editVehicle) {
      return
    }
    setError("")
    try {
      const response = await authenticatedFetch(
        withBasePath(`/api/vehicles/${editVehicle.id}`),
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(vehiclePayload(values)),
        },
      )
      const payload = (await response.json()) as VehiclesApiResponse
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Unable to save vehicle")
      }
      setEditVehicle(null)
      await loadVehicles()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save vehicle")
    }
  }

  async function handleDeleteVehicle(vehicleId: string) {
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
    setError("")
    try {
      const response = await authenticatedFetch(
        withBasePath(`/api/vehicles/${vehicleId}`),
        { method: "DELETE" },
      )
      const payload = (await response.json()) as VehiclesApiResponse
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Unable to delete vehicle")
      }
      if (editVehicle?.id === vehicleId) {
        setEditVehicle(null)
      }
      await loadVehicles()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete vehicle")
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
        {error ? (
          <p className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {isLoading ? (
          <p className="rounded-sm border border-border bg-brand-panel p-6 text-sm text-brand-muted">
            Loading vehicles...
          </p>
        ) : null}
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
