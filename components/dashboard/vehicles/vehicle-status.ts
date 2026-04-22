import type { VehicleStatus } from "@/lib/vehicles"

export const vehicleStatusClasses: Record<VehicleStatus, string> = {
  Active:
    "rounded-full border border-brand-success/20 bg-brand-success/10 px-3 py-1 text-xs font-medium text-brand-success hover:bg-brand-success/10",
  "In Service":
    "rounded-full border border-brand-warning/20 bg-brand-warning/10 px-3 py-1 text-xs font-medium text-brand-warning hover:bg-brand-warning/10",
  Inactive:
    "rounded-full border border-border bg-brand-panel-strong px-3 py-1 text-xs font-medium text-brand-muted hover:bg-brand-panel-strong",
}
