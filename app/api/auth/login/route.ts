import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  mergeCookieHeader,
  requestBackend,
} from "@/lib/auth/backend"
import type { AuthApiPayload } from "@/lib/auth/types"

export const dynamic = "force-dynamic"

function normalizeForwardedFor(value: string): string {
  if (process.env.NODE_ENV !== "production") {
    const [clientIp, ...remainingIps] = value.split(",")
    const normalizedClientIp = clientIp.trim()
    if (
      normalizedClientIp === "::1" ||
      normalizedClientIp === "[::1]" ||
      normalizedClientIp === "localhost"
    ) {
      return ["127.0.0.1", ...remainingIps].join(",")
    }
  }

  return value
}

function getForwardedFor(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return normalizeForwardedFor(forwardedFor)
  }

  const realIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip")
  if (realIp) {
    return normalizeForwardedFor(realIp)
  }

  if (process.env.NODE_ENV !== "production") {
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"])
    if (localHosts.has(request.nextUrl.hostname)) {
      return "127.0.0.1"
    }
  }

  return null
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()
  const forwardedFor = getForwardedFor(request)
  const backendResponse = await requestBackend("/api/v1/user/auth/login", {
    method: "POST",
    body,
    contentType: "application/json",
    userAgent: request.headers.get("user-agent"),
    forwardedFor,
  })
  const payload = (await backendResponse.json()) as AuthApiPayload
  const issuedCookies = getSetCookieHeaders(backendResponse.headers)

  if (backendResponse.ok && payload.ok && !payload.user.roles.includes("User")) {
    await requestBackend("/api/v1/user/auth/logout", {
      method: "POST",
      cookieHeader: mergeCookieHeader(null, issuedCookies),
      userAgent: request.headers.get("user-agent"),
      forwardedFor,
    })
    return NextResponse.json(
      {
        ok: false,
        success: false,
        message: "This account does not have user-dashboard access.",
      },
      { status: 403 },
    )
  }
  const response = NextResponse.json(payload, {
    status: backendResponse.status,
  })
  const retryAfter = backendResponse.headers.get("retry-after")
  if (retryAfter) {
    response.headers.set("retry-after", retryAfter)
  }
  if (backendResponse.ok) {
    applySetCookieHeaders(response, issuedCookies)
  }
  return response
}
