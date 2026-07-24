"use client"

import { useEffect } from "react"

import { refreshDashboardSession } from "@/lib/auth/client"

export function SessionKeepalive() {
  useEffect(() => {
    let lastRefresh = 0

    const refreshIfActive = () => {
      if (document.visibilityState === "hidden") return
      const now = Date.now()
      if (now - lastRefresh < 60_000) return
      lastRefresh = now
      void refreshDashboardSession()
    }

    refreshIfActive()
    window.addEventListener("focus", refreshIfActive)
    document.addEventListener("visibilitychange", refreshIfActive)

    return () => {
      window.removeEventListener("focus", refreshIfActive)
      document.removeEventListener("visibilitychange", refreshIfActive)
    }
  }, [])

  return null
}
