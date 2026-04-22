import { Card, CardContent } from "@/components/ui/card"

type BookingStat = {
  title: string
  value: string
}

type BookingStatsProps = {
  stats: BookingStat[]
}

export function BookingStats({ stats }: BookingStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((item) => (
        <Card
          key={item.title}
          className="rounded-sm border border-border bg-brand-panel"
        >
          <CardContent className="p-6">
            <div className="mb-2 text-sm text-brand-muted">{item.title}</div>
            <div className="text-3xl font-bold text-foreground">
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
