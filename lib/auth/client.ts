import { signOutFirebaseUser } from "@/lib/auth/firebase-client"
import { withBasePath } from "@/lib/routes"

const AUTH_API_PATH = withBasePath("/api/auth")
let refreshRequest: Promise<boolean> | null = null

export async function refreshDashboardSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch(`${AUTH_API_PATH}/refresh`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
  }
  let response = await fetch(input, requestInit)

  if (response.status === 401 && (await refreshDashboardSession())) {
    response = await fetch(input, requestInit)
  }

  return response
}

export async function logoutDashboard(): Promise<void> {
  await Promise.allSettled([
    fetch(`${AUTH_API_PATH}/logout`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }),
    signOutFirebaseUser(),
  ])
}
