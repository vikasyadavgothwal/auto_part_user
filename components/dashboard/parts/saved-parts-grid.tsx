"use client"

import { useState } from "react"
import { ExternalLink, Package, Trash2 } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authenticatedFetch } from "@/lib/auth/client"
import { withBasePath } from "@/lib/routes"
import {
  formatSavedPartPrice,
  productUrl,
  type SavedPartRecord,
} from "@/lib/saved-parts"

type SavedPartsGridProps = {
  parts: SavedPartRecord[]
  onRemove: (partUid: string) => void
  onWatchUpdate: (
    partUid: string,
    data: { watchForPriceDrops: boolean; watchForStockReturns: boolean },
  ) => void
}

export function SavedPartsGrid({
  parts,
  onRemove,
  onWatchUpdate,
}: SavedPartsGridProps) {
  const [removingPartUid, setRemovingPartUid] = useState<string | null>(null)
  const [updatingPartUid, setUpdatingPartUid] = useState<string | null>(null)

  const removePart = async (partUid: string) => {
    if (removingPartUid) return
    setRemovingPartUid(partUid)
    try {
      const response = await authenticatedFetch(withBasePath("/api/saved-parts"), {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ partUid }),
      })
      if (response.ok) onRemove(partUid)
    } finally {
      setRemovingPartUid(null)
    }
  }

  const updateWatchers = async (input: {
    partUid: string
    watchForPriceDrops: boolean
    watchForStockReturns: boolean
  }) => {
    if (updatingPartUid) return
    setUpdatingPartUid(input.partUid)
    try {
      const response = await authenticatedFetch(withBasePath("/api/saved-parts"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      })
      if (response.ok) {
        onWatchUpdate(input.partUid, {
          watchForPriceDrops: input.watchForPriceDrops,
          watchForStockReturns: input.watchForStockReturns,
        })
      }
    } finally {
      setUpdatingPartUid(null)
    }
  }

  if (parts.length === 0) {
    return (
      <Card className="rounded-sm border border-border bg-brand-panel">
        <CardContent className="p-10 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-brand-muted" />
          <h2 className="text-xl font-semibold text-foreground">
            No saved parts yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">
            Save products from the main website and they will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {parts.map((part) => (
        <Card
          key={part.partUid}
          className="group flex h-full min-w-0 flex-col overflow-hidden rounded-sm border border-border bg-brand-panel transition-all hover:border-primary"
        >
          <div className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden bg-brand-panel-strong sm:h-60">
            {part.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={part.image}
                alt={part.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-16 w-16 text-brand-muted" />
            )}

            <button
              type="button"
              onClick={() => void removePart(part.partUid)}
              disabled={Boolean(removingPartUid)}
              className="absolute right-3 top-3 rounded-sm bg-background/80 p-2 backdrop-blur-sm transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Remove ${part.title} from saved parts`}
            >
              <Trash2 className={removingPartUid === part.partUid ? "h-4 w-4 animate-pulse text-foreground" : "h-4 w-4 text-foreground"} />
            </button>

            {part.totalStock <= 0 ? (
              <Badge className="absolute bottom-3 left-3 rounded-full border border-brand-warning/20 bg-brand-warning/10 px-3 py-1 text-xs font-medium text-brand-warning hover:bg-brand-warning/10">
                Out of Stock
              </Badge>
            ) : null}
          </div>

          <CardContent className="flex flex-1 flex-col p-4">
            <div className="mb-1 text-xs text-brand-muted">
              {part.brandName || part.category || "AutoPartsPro"}
            </div>

            <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
              {part.title}
            </h3>

            <div className="mb-3 text-xs text-brand-muted">
              {part.partNumber ? `Part # ${part.partNumber}` : "Marketplace part"}
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-xs text-brand-muted">
              <span>{part.offerCount} verified offer{part.offerCount === 1 ? "" : "s"}</span>
              <span>{part.totalStock} in stock</span>
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-2xl font-bold text-primary">
                {formatSavedPartPrice(part)}
              </div>

              <Button
                asChild
                className="rounded-sm bg-primary px-4 py-2 text-sm text-foreground hover:bg-brand-primary-hover"
              >
                <a href={productUrl(part.partUid)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </a>
              </Button>
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <label className="flex items-center gap-2 text-sm text-brand-muted">
                <Checkbox
                  checked={part.watchForPriceDrops}
                  disabled={Boolean(updatingPartUid)}
                  onCheckedChange={(checked) =>
                    void updateWatchers({
                      partUid: part.partUid,
                      watchForPriceDrops: Boolean(checked),
                      watchForStockReturns: part.watchForStockReturns,
                    })
                  }
                />
                <span>Watch for lower price</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-brand-muted">
                <Checkbox
                  checked={part.watchForStockReturns}
                  disabled={Boolean(updatingPartUid)}
                  onCheckedChange={(checked) =>
                    void updateWatchers({
                      partUid: part.partUid,
                      watchForPriceDrops: part.watchForPriceDrops,
                      watchForStockReturns: Boolean(checked),
                    })
                  }
                />
                <span>Watch for stock return</span>
              </label>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
