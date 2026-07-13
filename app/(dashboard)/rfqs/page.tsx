import { cookies } from "next/headers"

import { RfqsPage } from "@/components/dashboard/rfqs/rfqs-page"
import type { RfqPagination, UserRfq } from "@/components/dashboard/rfqs/rfqs-data"
import { requestBackend } from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

export default async function MyRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>
}) {
  let rfqs: UserRfq[] = []
  let pagination: RfqPagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  }

  try {
    const response = await requestBackend("/api/v1/rfqs?page=1&pageSize=10", {
      cookieHeader: (await cookies()).toString(),
    })
    const payload = (await response.json()) as {
      ok: boolean
      rfqs?: UserRfq[]
      pagination?: RfqPagination
    }
    if (response.ok && payload.ok) {
      rfqs = payload.rfqs ?? []
      pagination = payload.pagination ?? pagination
    }
  } catch {}

  const { created } = await searchParams
  return (
    <RfqsPage
      initialRfqs={rfqs}
      initialPagination={pagination}
      createdRfqId={created || null}
    />
  )
}
