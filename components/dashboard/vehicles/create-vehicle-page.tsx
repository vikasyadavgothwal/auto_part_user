"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CarFront } from "lucide-react"
import { toast } from "sonner"

import { VehicleForm } from "@/components/vehicle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { readApiResponse } from "@/lib/api-response"
import { authenticatedFetch } from "@/lib/auth/client"
import { appRoutes, withBasePath } from "@/lib/routes"
import { type VehicleFormValues } from "@/lib/vehicles"

export function CreateVehiclePage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function lookupVin(vin: string) {
    const response = await authenticatedFetch(withBasePath(`/api/vehicles/vin-lookup?vin=${encodeURIComponent(vin)}`))
    const result = await readApiResponse<{ ok: boolean; found: boolean; vehicle?: { year: number; make: string; model: string }; message?: string }>(response, "Unable to look up VIN")
    return { found: result.found, ...result.vehicle, message: result.message }
  }

  async function handleCreateVehicle(values: VehicleFormValues) {
    setPending(true)
    try {
      const response = await authenticatedFetch(withBasePath("/api/vehicles"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          year: values.year,
          make: values.make,
          model: values.model,
          vin: values.vin,
          mileage: values.mileage,
          status: values.status,
          primary: values.primary,
        }),
      })
      await readApiResponse<{ ok: boolean; message?: string }>(
        response,
        "Unable to create vehicle",
        { ok: true },
      )
      toast.success("Vehicle created successfully")
      router.push(appRoutes.vehicles)
      router.refresh()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to create vehicle"
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <CarFront className="h-4 w-4" />
            Vehicle Setup
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Create Vehicle
          </h1>
          <p className="text-brand-muted">
            Add a vehicle once, then manage later updates from the edit dialog
            on the vehicles list.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(appRoutes.vehicles)}
          className="h-auto w-full gap-2 rounded-sm border-border bg-brand-surface px-5 py-3 text-foreground hover:bg-brand-panel-strong sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vehicles
        </Button>
      </div>

      <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
        <CardContent className="p-6">
          <VehicleForm
            submitLabel={pending ? "Creating..." : "Create Vehicle"}
            onVinLookup={lookupVin}
            onSubmit={handleCreateVehicle}
            onCancel={() => router.push(appRoutes.vehicles)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
