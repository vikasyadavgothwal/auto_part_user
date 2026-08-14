"use client"

import { Plus, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RequiredMark } from "@/components/ui/required-mark"

type PartItem = {
  id: number
  vin?: string
  partName: string
  partNumber: string
  quantity: number
  targetPrice: string
  notes: string
}

type RfqPartsSectionProps = {
  parts: PartItem[]
  selectedVehicleId: string
  importedVehicleCount: number
  saveResolvedVehicles: boolean
  maxParts: number
  fieldErrors: Record<string, string>
  fieldError: (key: string) => ReactNode
  partErrorKey: (id: number, field: keyof PartItem) => string
  digitsOnly: (value: string) => string
  decimalOnly: (value: string) => string
  updatePart: (id: number, field: keyof PartItem, value: string | number) => void
  removePart: (id: number) => void
  addPart: () => void
  setSaveResolvedVehicles: (value: boolean) => void
}

export function RfqPartsSection({
  parts,
  selectedVehicleId,
  importedVehicleCount,
  saveResolvedVehicles,
  maxParts,
  fieldErrors,
  fieldError,
  partErrorKey,
  digitsOnly,
  decimalOnly,
  updatePart,
  removePart,
  addPart,
  setSaveResolvedVehicles,
}: RfqPartsSectionProps) {
  // FIX: Extracted RFQ parts UI while preserving controller-owned mutations.
  return (
    <>
      <div className="space-y-4">
        {importedVehicleCount > 1 ? (
          <p className="rounded-sm border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">
            {`${importedVehicleCount} vehicles verified successfully.`}
          </p>
        ) : null}
        {parts.map((part, index) => (
          <div
            key={part.id}
            className="rounded-sm border border-border bg-brand-surface p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">Part {index + 1}</div>
                {part.vin ? <div className="text-xs text-brand-muted">VIN: {part.vin}</div> : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={parts.length === 1}
                onClick={() => removePart(part.id)}
                aria-label="Remove part"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2"><Label>{selectedVehicleId ? "Different vehicle VIN (optional)" : <>Vehicle VIN<RequiredMark /></>}</Label><Input value={part.vin ?? ""} maxLength={17} required={!selectedVehicleId} aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "vin")])} onChange={(event) => updatePart(part.id, "vin", event.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""))} placeholder={selectedVehicleId ? "Leave blank to use the selected vehicle" : "Enter the 17-character VIN"} className="h-10 uppercase border-border bg-brand-panel" /><span className="block text-xs text-brand-muted">{selectedVehicleId ? "Only enter this when this part is for another vehicle." : "Required because no saved vehicle is selected."}</span>{fieldError(partErrorKey(part.id, "vin"))}</label>
              <label className="space-y-2">
                <Label>Part Name<RequiredMark /></Label>
                <Input
                  value={part.partName}
                  maxLength={120}
                  required
                  aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "partName")])}
                  onChange={(event) => updatePart(part.id, "partName", event.target.value)}
                  placeholder="Brake pads"
                  className="h-10 border-border bg-brand-panel"
                />
                {fieldError(partErrorKey(part.id, "partName"))}
              </label>
              <label className="space-y-2">
                <Label>Part Number</Label>
                <Input
                  value={part.partNumber}
                  maxLength={80}
                  aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "partNumber")])}
                  onChange={(event) => updatePart(part.id, "partNumber", event.target.value)}
                  placeholder="BC1259"
                  className="h-10 border-border bg-brand-panel"
                />
                {fieldError(partErrorKey(part.id, "partNumber"))}
              </label>
              <label className="space-y-2">
                <Label>Quantity<RequiredMark /></Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={part.quantity}
                  maxLength={3}
                  required
                  aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "quantity")])}
                  onChange={(event) =>
                    updatePart(
                      part.id,
                      "quantity",
                      Number(digitsOnly(event.target.value).slice(0, 3)) || 1,
                    )
                  }
                  className="h-10 border-border bg-brand-panel"
                />
                {fieldError(partErrorKey(part.id, "quantity"))}
              </label>
              <label className="space-y-2">
                <Label>Target Price</Label>
                <Input
                  inputMode="decimal"
                  value={part.targetPrice}
                  maxLength={10}
                  aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "targetPrice")])}
                  onChange={(event) =>
                    updatePart(part.id, "targetPrice", decimalOnly(event.target.value))
                  }
                  placeholder="125"
                  className="h-10 border-border bg-brand-panel"
                />
                {fieldError(partErrorKey(part.id, "targetPrice"))}
              </label>
              <label className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Input
                  value={part.notes}
                  maxLength={500}
                  aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "notes")])}
                  onChange={(event) => updatePart(part.id, "notes", event.target.value)}
                  placeholder="Brand preference, warranty requirement, or other details"
                  className="h-10 border-border bg-brand-panel"
                />
                {fieldError(partErrorKey(part.id, "notes"))}
              </label>
            </div>
          </div>
        ))}
      </div>

      {parts.some((part) => part.vin) ? <label className="flex items-center gap-3 rounded-sm border border-border bg-brand-surface p-4 text-sm text-foreground"><input type="checkbox" checked={saveResolvedVehicles} onChange={(event) => setSaveResolvedVehicles(event.target.checked)} className="h-4 w-4 accent-primary" />Save newly resolved VIN vehicles to my account</label> : null}

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full gap-2 border-dashed"
        disabled={parts.length >= maxParts}
        onClick={addPart}
      >
        <Plus className="h-4 w-4" />
        Add Another Part
      </Button>
    </>
  )
}
