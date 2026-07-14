"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { EditVehicleDialog } from "@/components/dashboard/vehicles/edit-vehicle-dialog"
import { VehicleStats } from "@/components/dashboard/vehicles/vehicle-stats"
import { VehiclesInfoCard } from "@/components/dashboard/vehicles/vehicles-info-card"
import { VehiclesTable } from "@/components/dashboard/vehicles/vehicles-table"
import { Button } from "@/components/ui/button"
import { readApiResponse } from "@/lib/api-response"
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
  pagination?: VehiclePagination
  message?: string
}

type VehiclePagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const vehiclePageSize = 10
const emptyPagination: VehiclePagination = {
  page: 1,
  pageSize: vehiclePageSize,
  total: 0,
  totalPages: 1,
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
  const [pagination, setPagination] = useState<VehiclePagination>(emptyPagination)

  const loadVehicles = useCallback(async (page: number) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await authenticatedFetch(
        withBasePath(`/api/vehicles?page=${page}&pageSize=${vehiclePageSize}`),
      )
      const payload = await readApiResponse<VehiclesApiResponse>(
        response,
        "Unable to load vehicles",
      )

      let nextVehicles = payload.vehicles ?? []
      let nextPagination = payload.pagination ?? {
        ...emptyPagination,
        page,
      }
      if (!nextVehicles.length && nextPagination.total === 0 && page === 1) {
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
            withBasePath(`/api/vehicles?page=1&pageSize=${vehiclePageSize}`),
          )
          const migratedPayload = await readApiResponse<VehiclesApiResponse>(
            migratedResponse,
            "Unable to load migrated vehicles",
          )
          nextVehicles = migratedPayload.vehicles ?? []
          nextPagination = migratedPayload.pagination ?? nextPagination
        }
      }
      setVehicles(nextVehicles)
      setPagination(nextPagination)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load vehicles")
      setVehicles([])
      setPagination(emptyPagination)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadVehicles(1)
    }, 0)

    return () => window.clearTimeout(initialLoad)
  }, [loadVehicles])

  const totalVehicles = pagination.total
  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Active"
  ).length
  const rangeStart = totalVehicles
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 0
  const rangeEnd = Math.min(pagination.page * pagination.pageSize, totalVehicles)

  const stats = [
    {
      id: 1,
      title: "Total Vehicles",
      value: String(totalVehicles),
    },
    {
      id: 2,
      title: "Shown on Page",
      value: vehicles.length,
      subtitle: `Page ${pagination.page} of ${pagination.totalPages}`,
    },
    {
      id: 3,
      title: "Active Vehicles",
      value: String(activeVehicles),
      subtitle: "On this page",
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
      await readApiResponse<VehiclesApiResponse>(
        response,
        "Unable to save vehicle",
        { ok: true },
      )
      setEditVehicle(null)
      await loadVehicles(pagination.page)
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
      await readApiResponse<VehiclesApiResponse>(
        response,
        "Unable to delete vehicle",
        { ok: true },
      )
      if (editVehicle?.id === vehicleId) {
        setEditVehicle(null)
      }
      const nextPage =
        vehicles.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page
      await loadVehicles(nextPage)
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
        <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {rangeStart}-{rangeEnd} of {totalVehicles} vehicles
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || pagination.page <= 1}
              onClick={() => void loadVehicles(pagination.page - 1)}
            >
              Previous
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || pagination.page >= pagination.totalPages}
              onClick={() => void loadVehicles(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
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
