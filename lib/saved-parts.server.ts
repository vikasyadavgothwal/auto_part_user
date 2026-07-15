import { cookies } from "next/headers"

import { requestBackend } from "@/lib/auth/backend"
import type { SavedPartRecord } from "@/lib/saved-parts"

export {
  browsePartsUrl,
  buildSavedPartStats,
  formatSavedPartPrice,
  getMainWebsiteUrl,
  productUrl,
  type SavedPartRecord,
} from "@/lib/saved-parts"

type SavedPartsPayload = {
  ok: boolean
  parts?: SavedPartRecord[]
  summary?: {
    totalSaved: number
    inStock: number
    totalValue: number
  }
}

export async function getUserSavedParts(): Promise<SavedPartRecord[]> {
  try {
    const response = await requestBackend("/api/v1/user/saved-parts", {
      cookieHeader: (await cookies()).toString(),
    })
    if (!response.ok) return []

    const payload = (await response.json()) as SavedPartsPayload
    if (!payload.ok) return []
    return payload.parts ?? []
  } catch {
    return []
  }
}
