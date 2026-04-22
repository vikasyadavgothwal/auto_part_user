import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type OverviewStat = {
  title: string
  value: string
  subtext: string
  icon: LucideIcon
}

type OverviewStatsProps = {
  stats: OverviewStat[]
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon

        return (
          <Card
            key={item.title}
            className="rounded-sm border border-border bg-brand-panel transition-all hover:border-primary"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="text-sm font-medium text-brand-muted">
                  {item.title}
                </div>

                <div className="rounded-sm border border-primary/20 bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="mb-2">
                <div className="text-3xl font-bold text-foreground">
                  {item.value}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-brand-muted">{item.subtext}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
