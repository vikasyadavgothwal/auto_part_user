import { forwardBackendRequest } from "@/lib/auth/backend"

type NotificationReadContext = {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  context: NotificationReadContext,
) {
  const { id } = await context.params
  return forwardBackendRequest(
    request,
    `/api/v1/notifications/${encodeURIComponent(id)}/read`,
  )
}
