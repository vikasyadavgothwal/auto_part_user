import { forwardBackendRequest } from "@/lib/auth/backend"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; bidId: string }> },
) {
  const { id, bidId } = await context.params
  return forwardBackendRequest(request, `/api/v1/rfqs/${id}/bids/${bidId}/accept`)
}
