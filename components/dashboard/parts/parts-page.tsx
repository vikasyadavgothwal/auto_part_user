import Link from "next/link"

import { partStats, savedParts } from "@/components/dashboard/parts/parts-data"
import { PartStats } from "@/components/dashboard/parts/part-stats"
import { SavedPartsGrid } from "@/components/dashboard/parts/saved-parts-grid"
import { Button } from "@/components/ui/button"

export function PartsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Saved Parts
          </h1>
          <p className="text-brand-muted">
            Keep track of parts you&apos;re interested in.
          </p>
        </div>

        <Button
          asChild
          className="h-auto w-full rounded-sm bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Link href="/search">Browse Parts</Link>
        </Button>
      </div>

      <PartStats stats={partStats} />
      <SavedPartsGrid parts={savedParts} />
    </div>
  )
}
