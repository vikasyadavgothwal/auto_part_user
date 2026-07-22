import { forwardBackendRequest } from "@/lib/auth/backend";
type RouteContext = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return forwardBackendRequest(request, `/api/v1/orders/${encodeURIComponent(id)}/proof`);
}
