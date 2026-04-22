import { Funnel } from "lucide-react"

import { Button } from "@/components/ui/button"

type OrderFilter = {
  label: string
  active: boolean
}

type OrderFiltersProps = {
  filters: OrderFilter[]
}

export function OrderFilters({ filters }: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex items-center gap-2 text-brand-muted">
        <Funnel className="h-5 w-5" />
        <span className="font-medium">Filter:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.label}
            variant="outline"
            className={
              filter.active
                ? "rounded-sm border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "rounded-sm border-border bg-brand-panel text-brand-muted hover:border-primary hover:bg-brand-panel hover:text-brand-muted"
            }
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
