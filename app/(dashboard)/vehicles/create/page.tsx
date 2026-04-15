"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CarFront } from "lucide-react";
import { VehicleForm } from "@/components/vehicle-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { appRoutes } from "@/lib/routes";
import {
  createVehicleRecord,
  readVehiclesFromStorage,
  upsertVehicle,
  writeVehiclesToStorage,
  type VehicleFormValues,
} from "@/lib/vehicles";
export default function CreateVehiclePage() {
  const router = useRouter();

  function handleCreateVehicle(values: VehicleFormValues) {
    const nextVehicles = upsertVehicle(
      readVehiclesFromStorage(),
      createVehicleRecord(values),
    );
    writeVehiclesToStorage(nextVehicles);
    router.push(appRoutes.vehicles);
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
          className="h-auto w-full gap-2 rounded-lg border-border bg-brand-surface px-5 py-3 text-foreground hover:bg-brand-panel-strong sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vehicles
        </Button>
      </div>

      <Card className="rounded-lg border border-border bg-brand-panel shadow-none">
        <CardContent className="p-6">
          <VehicleForm
            submitLabel="Create Vehicle"
            onSubmit={handleCreateVehicle}
            onCancel={() => router.push(appRoutes.vehicles)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
