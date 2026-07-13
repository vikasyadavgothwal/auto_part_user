import { NextRequest, NextResponse } from "next/server"

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  requestBackend,
} from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

async function proxyReview(request: NextRequest, method: "POST" | "PATCH") {
  const backend = await requestBackend("/api/v1/user/garage-reviews", {
    method,
    cookieHeader: request.headers.get("cookie"),
    body: await request.text(),
    contentType: "application/json",
    userAgent: request.headers.get("user-agent"),
  })
  const response = new NextResponse(await backend.text(), {
    status: backend.status,
    headers: {
      "content-type": backend.headers.get("content-type") ?? "application/json",
    },
  })
  applySetCookieHeaders(response, getSetCookieHeaders(backend.headers))
  return response
}

export async function POST(request: NextRequest) {
  return proxyReview(request, "POST")
}

export async function PATCH(request: NextRequest) {
  return proxyReview(request, "PATCH")
}
