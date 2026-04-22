import { VehicleForm } from "@/components/vehicle-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  toVehicleFormValues,
  type VehicleRecord,
  type VehicleFormValues,
} from "@/lib/vehicles"

type EditVehicleDialogProps = {
  vehicle: VehicleRecord | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: VehicleFormValues) => void
  onCancel: () => void
}

export function EditVehicleDialog({
  vehicle,
  onOpenChange,
  onSubmit,
  onCancel,
}: EditVehicleDialogProps) {
  return (
    <Dialog open={Boolean(vehicle)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] border border-border bg-brand-panel p-0 text-foreground sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>
            Changes are applied only to the vehicle you selected.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <VehicleForm
            initialValues={toVehicleFormValues(vehicle ?? undefined)}
            submitLabel="Save Changes"
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
