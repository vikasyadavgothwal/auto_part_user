import { forwardBackendRequest } from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!request.headers.get("cookie")) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }
  return forwardBackendRequest(request, "/api/v1/notifications")
}
