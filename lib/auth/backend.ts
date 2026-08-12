import { NextResponse } from "next/server"

const DEFAULT_PROXY_TIMEOUT_MS = 10_000

type TimeoutRequestInit = RequestInit & {
  timeoutMs?: number
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: TimeoutRequestInit = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_PROXY_TIMEOUT_MS, signal, ...requestInit } = init
  if (signal) {
    return fetch(input, { ...requestInit, signal })
  }

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(new Error("Backend request timed out")),
    timeoutMs,
  )

  try {
    return await fetch(input, { ...requestInit, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

const parseCookieHeader = (header: string | null) => {
  const cookies = new Map<string, string>()

  for (const segment of header?.split(";") ?? []) {
    const trimmed = segment.trim()
    const index = trimmed.indexOf("=")
    if (index > 0) {
      cookies.set(trimmed.slice(0, index).trim(), trimmed.slice(index + 1).trim())
    }
  }

  return cookies
}

const encodeCookies = (cookies: Map<string, string>) =>
  Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ")

const getBackendBaseUrl = ({
  envNames,
  fallback,
  missingMessage,
}: {
  envNames: readonly string[]
  fallback?: string
  missingMessage: string
}) => {
  for (const name of envNames) {
    const value = process.env[name]?.trim()
    if (value) return value
  }

  if (fallback !== undefined && process.env.NODE_ENV !== "production") {
    return fallback
  }

  throw new Error(missingMessage)
}

const getSetCookieHeadersShared = (headers: Headers): string[] => {
  const enhancedHeaders = headers as Headers & {
    getSetCookie?: () => string[]
  }
  const values = enhancedHeaders.getSetCookie?.()
  if (values?.length) return values

  const combinedValue = headers.get("set-cookie")
  return combinedValue ? [combinedValue] : []
}

const mergeCookieHeaderShared = (
  currentHeader: string | null,
  setCookieValues: string[],
) => {
  const cookies = parseCookieHeader(currentHeader)

  for (const setCookie of setCookieValues) {
    const pair = setCookie.split(";", 1)[0]
    const index = pair.indexOf("=")
    if (index > 0) {
      cookies.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
    }
  }

  return encodeCookies(cookies)
}

const streamBackendRequest = async ({
  request,
  backendUrl,
  method: requestedMethod,
  includeSetCookie = false,
}: {
  request: Request
  backendUrl: URL
  method?: string
  includeSetCookie?: boolean
}) => {
  const method = (requestedMethod ?? request.method).toUpperCase()
  const headers = new Headers({ accept: "application/json" })
  const contentType = request.headers.get("content-type")
  const cookie = request.headers.get("cookie")
  const userAgent = request.headers.get("user-agent")
  const forwardedFor = request.headers.get("x-forwarded-for")

  if (contentType) headers.set("content-type", contentType)
  if (cookie) headers.set("cookie", cookie)
  if (userAgent) headers.set("user-agent", userAgent)
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor)

  let body: ArrayBuffer | undefined
  try {
    if (method !== "GET" && method !== "HEAD") {
      body = await request.arrayBuffer()
    }
  } catch {
    return Response.json({ ok: false, message: "Backend unavailable" }, { status: 503 })
  }

  let backendResponse: Response
  try {
    backendResponse = await fetchWithTimeout(backendUrl, {
      method,
      cache: "no-store",
      headers,
      body,
    })
  } catch {
    return Response.json({ ok: false, message: "Backend unavailable" }, { status: 503 })
  }

  const response = new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      "content-type": backendResponse.headers.get("content-type") ?? "application/json",
    },
  })

  if (includeSetCookie) {
    for (const value of getSetCookieHeadersShared(backendResponse.headers)) {
      response.headers.append("set-cookie", value)
    }
  }

  return response
}

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
