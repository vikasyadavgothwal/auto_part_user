import { Card, CardContent } from "@/components/ui/card"

type OrderStat = {
  title: string
  value: string
  valueClass: string
}

type OrderStatsProps = {
  stats: OrderStat[]
}

export function OrderStats({ stats }: OrderStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <Card
          key={item.title}
          className="rounded-sm border border-border bg-brand-panel"
        >
          <CardContent className="p-6">
            <div className="mb-2 text-sm text-brand-muted">{item.title}</div>
            <div className={`text-3xl font-bold ${item.valueClass}`}>
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
