import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  mergeCookieHeader,
  requestBackend,
} from "@/lib/auth/backend"
import type { AuthApiPayload } from "@/lib/auth/types"
import { appRoutes, withBasePath } from "@/lib/routes"

export const dynamic = "force-dynamic"

async function refresh(request: NextRequest): Promise<{
  response: NextResponse
  ok: boolean
}> {
  const currentCookies = request.headers.get("cookie")
  const backendRefresh = await requestBackend("/api/v1/user/auth/refresh", {
    method: "POST",
    cookieHeader: currentCookies,
    userAgent: request.headers.get("user-agent"),
  })
  const refreshCookies = getSetCookieHeaders(backendRefresh.headers)

  if (!backendRefresh.ok) {
    const response = NextResponse.json(
      { ok: false, success: false, message: "Session expired" },
      { status: 401 },
    )
    applySetCookieHeaders(response, refreshCookies)
    return { response, ok: false }
  }

  const rotatedCookieHeader = mergeCookieHeader(currentCookies, refreshCookies)
  const sessionResponse = await requestBackend("/api/v1/user/auth/me", {
    cookieHeader: rotatedCookieHeader,
  })
  const sessionPayload = (await sessionResponse.json()) as AuthApiPayload

  if (
    !sessionResponse.ok ||
    !sessionPayload.ok ||
    !sessionPayload.user.roles.includes("User")
  ) {
    const response = NextResponse.json(
      { ok: false, success: false, message: "User access is required" },
      { status: 403 },
    )
    applySetCookieHeaders(response, refreshCookies)
    return { response, ok: false }
  }

  const response = NextResponse.json(sessionPayload)
  applySetCookieHeaders(response, refreshCookies)
  return { response, ok: true }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return (await refresh(request)).response
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await refresh(request)
  const destination = new URL(
    result.ok
      ? withBasePath(appRoutes.overview)
      : withBasePath(appRoutes.login),
    request.url,
  )
  const response = NextResponse.redirect(destination)
  for (const value of getSetCookieHeaders(result.response.headers)) {
    response.headers.append("set-cookie", value)
  }
  return response
}
