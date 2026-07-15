import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  requestBackend,
} from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const backendResponse = await requestBackend("/api/v1/user/auth/logout", {
    method: "POST",
    cookieHeader: request.headers.get("cookie"),
    userAgent: request.headers.get("user-agent"),
  })
  const response = NextResponse.json({
    ok: true,
    success: true,
    message: "Logged out successfully",
  })
  applySetCookieHeaders(
    response,
    getSetCookieHeaders(backendResponse.headers),
  )
  return response
}
