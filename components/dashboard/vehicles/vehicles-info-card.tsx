import { Card, CardContent } from "@/components/ui/card"

export function VehiclesInfoCard() {
  return (
    <Card className="rounded-sm border border-border bg-brand-panel">
      <CardContent className="p-6">
        <h3 className="mb-2 font-semibold text-foreground">
          Why add vehicles?
        </h3>
        <p className="mb-4 text-sm text-brand-muted">
          Adding your vehicles keeps fitment, pricing, and service tracking
          aligned with the exact unit you&apos;re managing.
        </p>

        <ul className="space-y-2 text-sm text-brand-muted">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Open the edit dialog from any vehicle row</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Update mileage, VIN, status, or primary assignment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Save changes only to the selected vehicle</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
