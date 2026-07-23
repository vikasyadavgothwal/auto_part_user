import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  requestBackend,
} from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const source = request.nextUrl
  const params = new URLSearchParams()
  for (const key of ["garageId", "serviceId", "bookingDate"]) {
    const value = source.searchParams.get(key)
    if (value) params.set(key, value)
  }

  const backend = await requestBackend(
    `/api/v1/public/garage-bookings?${params.toString()}`,
    {
      cookieHeader: request.headers.get("cookie"),
      userAgent: request.headers.get("user-agent"),
    },
  )

  const response = new NextResponse(await backend.text(), {
    status: backend.status,
    headers: {
      "content-type": backend.headers.get("content-type") ?? "application/json",
    },
  })
  applySetCookieHeaders(response, getSetCookieHeaders(backend.headers))
  return response
}
