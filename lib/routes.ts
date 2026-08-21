const DEFAULT_BASE_PATH = "/user_dashboard"

function normalizeBasePath(value?: string) {
  if (!value) {
    return DEFAULT_BASE_PATH
  }

  const trimmedValue = value.trim().replace(/\/+$/, "")

  if (!trimmedValue || trimmedValue === "/") {
    return DEFAULT_BASE_PATH
  }

  return trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`
}

export const appBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

export const appRoutes = {
  overview: "/",
  legacyOverview: "/dashboard",
  vehicles: "/vehicles",
  createVehicle: "/vehicles/create",
  rfqs: "/rfqs",
  createRfq: "/rfqs/create",
  orders: "/orders",
  bookings: "/bookings",
  payments: "/payments",
  parts: "/parts",
  suppliers: "/suppliers",
  settings: "/settings",
  login: "/login",
} as const

export function withBasePath(path: string): string {
  if (path === "/") {
    return appBasePath
  }
  return `${appBasePath}${path.startsWith("/") ? path : `/${path}`}`
}

export function stripBasePath(pathname: string | null) {
  if (!pathname) {
    return appRoutes.overview
  }

  if (pathname === appBasePath) {
    return appRoutes.overview
  }

  if (pathname.startsWith(`${appBasePath}/`)) {
    return pathname.slice(appBasePath.length) || appRoutes.overview
  }

  return pathname
}
