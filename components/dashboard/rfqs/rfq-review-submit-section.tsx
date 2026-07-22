"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type PartItem = {
  id: number
  vin?: string
  partName: string
  partNumber: string
  quantity: number
  targetPrice: string
  notes: string
}

type VehicleDetails = {
  year: string
  make: string
  model: string
  trim: string
  vin: string
}

export function RfqReviewSubmitSection({
  projectName,
  deadline,
  vehicle,
  parts,
  totalQuantity,
}: {
  projectName: string
  deadline: string
  vehicle: VehicleDetails
  parts: PartItem[]
  totalQuantity: number
}) {
  // FIX: Extracted RFQ review UI while keeping submit logic in controller.
  return (
    <Card className="rounded-sm border-border bg-brand-panel">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Review RFQ</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Confirm the request before sending it to suppliers.
          </p>
        </div>
        <div className="grid gap-4 rounded-sm border border-border bg-brand-surface p-4 text-sm md:grid-cols-2">
          <p>
            <span className="text-brand-muted">Project:</span> {projectName}
          </p>
          <p>
            <span className="text-brand-muted">Deadline:</span> {deadline}
          </p>
          <p>
            <span className="text-brand-muted">Vehicle:</span>{" "}
            {[vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
              .filter(Boolean)
              .join(" ")}
          </p>
          <p>
            <span className="text-brand-muted">VIN:</span> {vehicle.vin || "-"}
          </p>
          <p>
            <span className="text-brand-muted">Line items:</span> {parts.length}
          </p>
          <p>
            <span className="text-brand-muted">Total quantity:</span> {totalQuantity}
          </p>
        </div>
        <div className="space-y-3">
          {parts.map((part) => (
            <div
              key={part.id}
              className="rounded-sm border border-border bg-brand-surface p-4 text-sm"
            >
              <div className="font-semibold text-foreground">{part.partName}</div>
              <div className="mt-1 text-brand-muted">
                Part #: {part.partNumber || "-"} · Qty {part.quantity}
                {part.targetPrice ? ` · Target AED ${part.targetPrice}` : ""}
              </div>
              {part.notes ? <div className="mt-2 text-brand-muted">{part.notes}</div> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function RfqSubmitNavigation({
  step,
  isSubmitting,
  vehicleAssignmentComplete,
  handleBack,
  handleNext,
  handleSubmit,
}: {
  step: 1 | 2 | 3
  isSubmitting: boolean
  vehicleAssignmentComplete: boolean
  handleBack: () => void
  handleNext: () => void
  handleSubmit: () => void
}) {
  // FIX: Extracted RFQ footer navigation while keeping step logic in controller.
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      <Button
        type="button"
        variant="outline"
        disabled={step === 1 || isSubmitting}
        onClick={handleBack}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      {step < 3 ? (
        <Button
          type="button"
          disabled={isSubmitting || (step === 1 && !vehicleAssignmentComplete)}
          onClick={handleNext}
          className="gap-2 bg-primary text-primary-foreground hover:bg-brand-primary-hover"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
          className="bg-primary text-primary-foreground hover:bg-brand-primary-hover"
        >
          {isSubmitting ? "Submitting..." : "Submit RFQ to Suppliers"}
        </Button>
      )}
    </div>
  )
}
