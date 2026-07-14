"use client"

import { useMemo, useState } from "react"

import { PartStats } from "@/components/dashboard/parts/part-stats"
import { SavedPartsGrid } from "@/components/dashboard/parts/saved-parts-grid"
import { Button } from "@/components/ui/button"
import {
  buildSavedPartStats,
  type SavedPartRecord,
} from "@/lib/saved-parts"

type PartsPageClientProps = {
  initialParts: SavedPartRecord[]
  browsePartsHref: string
}

export function PartsPageClient({
  initialParts,
  browsePartsHref,
}: PartsPageClientProps) {
  const [parts, setParts] = useState(initialParts)
  const stats = useMemo(() => buildSavedPartStats(parts), [parts])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Saved Parts
          </h1>
          <p className="text-brand-muted">
            Keep track of parts you saved from the main website.
          </p>
        </div>

        <Button
          asChild
          className="h-auto w-full rounded-sm bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <a href={browsePartsHref}>Browse Parts</a>
        </Button>
      </div>

      <PartStats stats={stats} />
      <SavedPartsGrid
        parts={parts}
        onRemove={(partUid) =>
          setParts((current) =>
            current.filter((part) => part.partUid !== partUid),
          )
        }
      />
    </div>
  )
}
