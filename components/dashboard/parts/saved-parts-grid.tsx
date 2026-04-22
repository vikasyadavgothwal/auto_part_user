import { Package, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type SavedPart = {
  brand: string
  title: string
  fit: string
  price: string
  actionLabel: string
  inStock: boolean
  stockLabel: string
}

type SavedPartsGridProps = {
  parts: SavedPart[]
}

export function SavedPartsGrid({ parts }: SavedPartsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {parts.map((part) => (
        <Card
          key={`${part.brand}-${part.title}`}
          className="group overflow-hidden rounded-sm border border-border bg-brand-panel transition-all hover:border-primary"
        >
          <div className="relative flex aspect-square items-center justify-center bg-brand-panel-strong">
            <Package className="h-16 w-16 text-brand-muted" />

            <button
              type="button"
              className="absolute right-3 top-3 rounded-sm bg-background/50 p-2 backdrop-blur-sm transition-all hover:bg-primary"
            >
              <Trash2 className="h-4 w-4 text-foreground" />
            </button>

            {!part.inStock ? (
              <Badge className="absolute bottom-3 left-3 rounded-full border border-brand-warning/20 bg-brand-warning/10 px-3 py-1 text-xs font-medium text-brand-warning hover:bg-brand-warning/10">
                {part.stockLabel}
              </Badge>
            ) : null}
          </div>

          <CardContent className="p-4">
            <div className="mb-1 text-xs text-brand-muted">{part.brand}</div>

            <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
              {part.title}
            </h3>

            <div className="mb-3 text-xs text-brand-muted">{part.fit}</div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-2xl font-bold text-primary">
                {part.price}
              </div>

              {part.inStock ? (
                <Button className="rounded-sm bg-primary px-4 py-2 text-sm text-foreground hover:bg-brand-primary-hover">
                  {part.actionLabel}
                </Button>
              ) : (
                <Button
                  disabled
                  className="cursor-not-allowed rounded-sm bg-brand-panel-strong px-4 py-2 text-sm text-brand-muted hover:bg-brand-panel-strong"
                >
                  {part.actionLabel}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
