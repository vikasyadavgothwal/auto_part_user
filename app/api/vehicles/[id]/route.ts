import { forwardBackendRequest } from "@/lib/auth/backend"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  return forwardBackendRequest(request, `/api/v1/user/vehicles/${id}`)
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  return forwardBackendRequest(request, `/api/v1/user/vehicles/${id}`)
}
