"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CarFront } from "lucide-react"

import { VehicleForm } from "@/components/vehicle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authenticatedFetch } from "@/lib/auth/client"
import { appRoutes, withBasePath } from "@/lib/routes"
import { type VehicleFormValues } from "@/lib/vehicles"

export function CreateVehiclePage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleCreateVehicle(values: VehicleFormValues) {
    setPending(true)
    setError("")
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
      const payload = (await response.json()) as { ok: boolean; message?: string }
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Unable to create vehicle")
      }
      router.push(appRoutes.vehicles)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create vehicle")
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
          {error ? (
            <p className="mb-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <VehicleForm
            submitLabel={pending ? "Creating..." : "Create Vehicle"}
            onSubmit={handleCreateVehicle}
            onCancel={() => router.push(appRoutes.vehicles)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
