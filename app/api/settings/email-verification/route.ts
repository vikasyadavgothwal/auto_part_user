import { NextRequest, NextResponse } from "next/server";

import {
  applySetCookieHeaders,
  getSetCookieHeaders,
  requestBackend,
} from "@/lib/auth/backend";
import { appBasePath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const origin = new URL(request.url).origin;
  const backend = await requestBackend(
    "/api/v1/user/settings/email-verification",
    {
      method: "POST",
      cookieHeader: request.headers.get("cookie"),
      body: JSON.stringify({
        ...(body ?? {}),
        verificationBaseUrl: `${origin}${appBasePath}`,
      }),
      contentType: "application/json",
      userAgent: request.headers.get("user-agent"),
    },
  );
  const response = new NextResponse(await backend.text(), {
    status: backend.status,
    headers: {
      "content-type": backend.headers.get("content-type") ?? "application/json",
    },
  });
  applySetCookieHeaders(response, getSetCookieHeaders(backend.headers));
  return response;
}
