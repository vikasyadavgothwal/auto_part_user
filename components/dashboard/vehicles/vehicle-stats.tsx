import { Truck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type VehicleStat = {
  id: number
  title: string
  value: string | number
  subtitle?: string
}

type VehicleStatsProps = {
  stats: VehicleStat[]
}

export function VehicleStats({ stats }: VehicleStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((item) => (
        <Card
          key={item.id}
          className="rounded-sm border border-border bg-brand-panel"
        >
          <CardContent className="p-6">
            <div className="mb-2 flex gap-2 text-sm text-brand-muted">
              {item.id === 1 && <Truck className="h-5 w-5 text-primary" />}{" "}
              {item.title}
            </div>
            <div className="text-3xl font-bold text-foreground">
              {item.value}
            </div>
            <div className="mt-1 text-sm text-brand-muted">
              {item.subtitle ? item.title : ""}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
