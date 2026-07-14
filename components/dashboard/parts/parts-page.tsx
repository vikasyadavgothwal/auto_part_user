import { PartsPageClient } from "@/components/dashboard/parts/parts-page-client"
import {
  browsePartsUrl,
  getUserSavedParts,
} from "@/lib/saved-parts.server"

export async function PartsPage() {
  const parts = await getUserSavedParts()

  return (
    <PartsPageClient
      initialParts={parts}
      browsePartsHref={browsePartsUrl()}
    />
  )
}
