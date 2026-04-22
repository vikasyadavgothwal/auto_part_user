import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type PartStat = {
  title: string
  value: string
  showIcon: boolean
  icon?: LucideIcon
}

type PartStatsProps = {
  stats: PartStat[]
}

export function PartStats({ stats }: PartStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon

        return (
          <Card
            key={item.title}
            className="rounded-sm border border-border bg-brand-panel"
          >
            <CardContent className="p-6">
              {item.showIcon && Icon ? (
                <div className="mb-2 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="text-sm text-brand-muted">{item.title}</div>
                </div>
              ) : (
                <div className="mb-2 text-sm text-brand-muted">
                  {item.title}
                </div>
              )}

              <div className="text-3xl font-bold text-foreground">
                {item.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
