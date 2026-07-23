"use client"

import { Download, Upload } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { withBasePath } from "@/lib/routes"
import { getVehicleDisplayName, type VehicleRecord } from "@/lib/vehicles"

type RfqVehicleSectionProps = {
  vehicles: VehicleRecord[]
  selectedVehicleId: string
  isImporting: boolean
  fieldError: (key: string) => ReactNode
  selectVehicle: (vehicleId: string) => void
  importRfqFile: (file: File | undefined) => Promise<void>
  children: ReactNode
}

export function RfqVehicleSection({
  vehicles,
  selectedVehicleId,
  isImporting,
  fieldError,
  selectVehicle,
  importRfqFile,
  children,
}: RfqVehicleSectionProps) {
  // FIX: Extracted RFQ vehicle/import UI while keeping controller-owned state.
  return (
    <Card className="rounded-sm border-border bg-brand-panel">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Choose how to identify the vehicle</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Use a saved vehicle, or enter a VIN with each requested part. You only need to use one method.
          </p>
          {fieldError("parts")}
        </div>

        <label className="space-y-2">
          <Label>Option 1 — Select a saved vehicle</Label>
          <select
            value={selectedVehicleId}
            onChange={(event) => selectVehicle(event.target.value)}
            className="h-10 w-full rounded-sm border border-border bg-brand-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary"
          >
            <option value="">No saved vehicle selected</option>
            {vehicles.map((item) => (
              <option key={item.id} value={item.id}>
                {getVehicleDisplayName(item)} · {item.vin}
              </option>
            ))}
          </select>
          <span className="block text-xs text-brand-muted">The selected vehicle applies to every part unless you enter a different VIN on a part.</span>
        </label>

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-brand-muted"><span className="h-px flex-1 bg-border" /><span>or</span><span className="h-px flex-1 bg-border" /></div>

        <div className="rounded-sm border border-border bg-brand-surface p-4">
          <p className="font-medium text-foreground">Option 2 — Enter VINs with the parts</p>
          <p className="mt-1 text-sm text-brand-muted">Use this for an unsaved vehicle or when the request contains different vehicles. Every VIN must contain 17 valid characters.</p>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-sm border-2 border-dashed border-border bg-brand-surface p-4 hover:border-primary">
          <span><span className="flex items-center gap-2 font-medium text-foreground"><Upload className="h-5 w-5" />Import CSV or Excel</span><span className="mt-1 block text-sm text-brand-muted">Columns: VIN No, Quantity, Target Price, Part Number, Part Name</span></span>
          <span className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground">{isImporting ? "Importing..." : "Choose file"}</span>
          <input type="file" className="sr-only" accept=".csv,.xlsx,.xls" disabled={isImporting} onChange={(event) => { void importRfqFile(event.target.files?.[0]); event.currentTarget.value = "" }} />
        </label>
        <div className="flex justify-end">
          <a
            href={withBasePath("/templates/rfq-import-template.csv")}
            download="rfq-import-template.csv"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Download className="h-4 w-4" />
            Download sample RFQ CSV
          </a>
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
