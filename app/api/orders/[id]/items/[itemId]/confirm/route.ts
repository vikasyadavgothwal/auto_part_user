import { forwardBackendRequest } from "@/lib/auth/backend";

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id, itemId } = await context.params;
  return forwardBackendRequest(
    request,
    `/api/v1/orders/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/confirm`,
  );
}
