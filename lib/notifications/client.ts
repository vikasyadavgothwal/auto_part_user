"use client"

import { authenticatedFetch } from "@/lib/auth/client"
import { withBasePath } from "@/lib/routes"

export type DashboardNotification = {
  id: string
  type: string
  title: string
  body: string
  linkUrl: string | null
  entityType: string | null
  entityId: string | null
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export const notificationsApiPath = withBasePath("/api/notifications")
export const notificationsStreamPath = withBasePath("/api/notifications/stream")
export const notificationsReadAllPath = withBasePath(
  "/api/notifications/read-all",
)
export const notificationReadPath = (id: string) =>
  withBasePath(`/api/notifications/${encodeURIComponent(id)}/read`)
export const notificationHref = (path: string) =>
  /^https?:\/\//.test(path) ? path : withBasePath(path)
export const notificationFetch = authenticatedFetch
