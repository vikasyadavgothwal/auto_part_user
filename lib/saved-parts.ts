export type SavedPartRecord = {
  partUid: string
  title: string
  partNumber: string | null
  brandName: string | null
  category: string | null
  description: string
  image: string
  images: string[]
  offerCount: number
  totalStock: number
  minPrice: number | null
  currency: string
  savedAt: string
}

export const getMainWebsiteUrl = () => {
  const configuredUrl =
    process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim()

  return configuredUrl ? configuredUrl.replace(/\/+$/, "") : ""
}

export const productUrl = (partUid: string) =>
  `${getMainWebsiteUrl()}/product/${encodeURIComponent(partUid)}`

export const browsePartsUrl = () => `${getMainWebsiteUrl()}/search`

export const formatSavedPartPrice = (part: SavedPartRecord) =>
  typeof part.minPrice === "number"
    ? `${part.currency} ${part.minPrice.toFixed(2)}`
    : "View offers"

export const buildSavedPartStats = (parts: SavedPartRecord[]) => [
  {
    title: "Saved Parts",
    value: String(parts.length),
    showIcon: true,
  },
  {
    title: "In Stock",
    value: String(parts.filter((part) => part.totalStock > 0).length),
    showIcon: false,
  },
  {
    title: "Total Value",
    value: `AED ${parts
      .reduce((total, part) => total + (part.minPrice ?? 0), 0)
      .toFixed(2)}`,
    showIcon: false,
  },
]
