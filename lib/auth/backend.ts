import { NextResponse } from "next/server"
import {
  DEFAULT_PROXY_TIMEOUT_MS,
  fetchWithTimeout,
  getBackendBaseUrl,
  getSetCookieHeaders as getSetCookieHeadersShared,
  mergeCookieHeader as mergeCookieHeaderShared,
  streamBackendRequest,
} from "@shared/backend-proxy"

const DEFAULT_BACKEND_URL = "http://localhost:3000"

const getBackendBaseUrlFromEnv = () =>
  getBackendBaseUrl({
    envNames: [
      "ADMIN_API_BASE_URL",
      "BACKEND_URL",
      "NEXT_PUBLIC_ADMIN_API_BASE_URL",
    ],
    fallback:
      process.env.NODE_ENV === "production" ? undefined : DEFAULT_BACKEND_URL,
    missingMessage:
      "Missing backend API URL. Set ADMIN_API_BASE_URL, BACKEND_URL, or NEXT_PUBLIC_ADMIN_API_BASE_URL.",
  })

export function getBackendUrl(path: string): URL {
  const baseUrl = getBackendBaseUrlFromEnv()
  return new URL(path, baseUrl)
}

export function applySetCookieHeaders(
  response: NextResponse | Response,
  values: string[],
): void {
  for (const value of values) {
    response.headers.append("set-cookie", value)
  }
}

export function mergeCookieHeader(
  currentHeader: string | null,
  setCookieValues: string[],
): string {
  return mergeCookieHeaderShared(currentHeader, setCookieValues)
}

export function getSetCookieHeaders(headers: Headers): string[] {
  return getSetCookieHeadersShared(headers)
}

export async function requestBackend(
  path: string,
  options: {
    method?: string
    cookieHeader?: string | null
    body?: BodyInit | null
    contentType?: string | null
    userAgent?: string | null
    forwardedFor?: string | null
    timeoutMs?: number
  } = {},
): Promise<Response> {
  const headers = new Headers({ accept: "application/json" })
  if (options.cookieHeader) headers.set("cookie", options.cookieHeader)
  if (options.contentType) headers.set("content-type", options.contentType)
  if (options.userAgent) headers.set("user-agent", options.userAgent)
  if (options.forwardedFor) headers.set("x-forwarded-for", options.forwardedFor)

  try {
    return await fetchWithTimeout(getBackendUrl(path), {
      method: options.method ?? "GET",
      cache: "no-store",
      headers,
      body: options.body,
      timeoutMs: options.timeoutMs ?? DEFAULT_PROXY_TIMEOUT_MS,
    })
  } catch {
    return Response.json({ ok: false, message: "Backend unavailable" }, { status: 503 })
  }
}

export async function forwardBackendRequest(
  request: Request,
  path: string,
): Promise<Response> {
  const sourceUrl = new URL(request.url)
  const url = getBackendUrl(path)
  url.search = sourceUrl.search

  return streamBackendRequest({
    request,
    backendUrl: url,
    method: request.method.toUpperCase(),
    includeSetCookie: true,
  })
}
