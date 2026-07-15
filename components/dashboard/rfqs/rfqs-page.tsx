"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Plus, Search } from "lucide-react"

import { RfqStats } from "@/components/dashboard/rfqs/rfq-stats"
import { RfqStepsCard } from "@/components/dashboard/rfqs/rfq-steps-card"
import { rfqSteps, type RfqPagination, type UserRfq } from "@/components/dashboard/rfqs/rfqs-data"
import { RfqsTable } from "@/components/dashboard/rfqs/rfqs-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { readApiResponse } from "@/lib/api-response"
import { authenticatedFetch } from "@/lib/auth/client"
import { appRoutes, withBasePath } from "@/lib/routes"

type RfqsPageProps = {
  initialRfqs: UserRfq[]
  initialPagination: RfqPagination
  createdRfqId: string | null
}

function buildRfqStats(rfqs: UserRfq[]) {
  return [
    {
      title: "Total RFQs",
      value: String(rfqs.length),
      valueClass: "text-foreground",
    },
    {
      title: "Active",
      value: String(rfqs.filter((rfq) => rfq.status === "open").length),
      valueClass: "text-primary",
    },
    {
      title: "Total Quotes",
      value: String(rfqs.reduce((sum, rfq) => sum + rfq.bids.length, 0)),
      valueClass: "text-foreground",
    },
    {
      title: "Orders Created",
      value: String(rfqs.filter((rfq) => rfq.order).length),
      valueClass: "text-foreground",
    },
  ]
}

export function RfqsPage({
  initialRfqs,
  initialPagination,
  createdRfqId,
}: RfqsPageProps) {
  const [rfqs, setRfqs] = useState(initialRfqs)
  const [pagination, setPagination] = useState(initialPagination)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function load(page: number, query = search) {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        search: query.trim(),
      })
      const response = await authenticatedFetch(withBasePath(`/api/rfqs?${params}`))
      const payload = await readApiResponse<{
        ok: boolean
        rfqs?: UserRfq[]
        pagination?: RfqPagination
        message?: string
      }>(response, "Unable to load RFQs")
      if (!payload.rfqs || !payload.pagination) {
        throw new Error(payload.message || "Unable to load RFQs")
      }
      setRfqs(payload.rfqs)
      setPagination(payload.pagination)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load RFQs")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My RFQs</h1>
          <p className="text-brand-muted">
            Request quotes, compare supplier quotations, and create orders.
          </p>
        </div>

        <Button
          asChild
          className="h-auto w-full gap-2 rounded-sm bg-primary px-6 py-3 text-primary-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Link href={appRoutes.createRfq}>
            <Plus className="h-5 w-5" />
            Create RFQ
          </Link>
        </Button>
      </div>

      {createdRfqId ? (
        <div
          role="status"
          className="flex items-center gap-3 rounded-sm border border-brand-success/30 bg-brand-success/10 p-4 text-sm text-brand-success"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span>
            <strong>{createdRfqId === "1" ? "RFQ" : createdRfqId}</strong>{" "}
            created successfully. It is now available for supplier quotes.
          </span>
        </div>
      ) : null}

      <RfqStats stats={buildRfqStats(rfqs)} />

      <form
        className="flex max-w-2xl gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void load(1)
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search RFQ ID, project, vehicle, VIN, or part..."
            className="h-10 border-border bg-brand-panel pl-9 text-foreground"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-10 bg-primary text-primary-foreground">
          Search
        </Button>
        {search ? (
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={() => {
              setSearch("")
              void load(1, "")
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>

      {error ? (
        <p className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <RfqsTable
        rfqs={rfqs}
        onAccepted={(rfqId, bidId, order) =>
          setRfqs((current) =>
            current.map((rfq) =>
              rfq.id === rfqId
                ? {
                    ...rfq,
                    status: "closed",
                    order,
                    bids: rfq.bids.map((bid) => ({
                      ...bid,
                      status:
                        bid.id === bidId
                          ? "accepted"
                          : bid.status === "submitted"
                            ? "rejected"
                            : bid.status,
                    })),
                  }
                : rfq,
            ),
          )
        }
      />

      <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {rfqs.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
          -{Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
          {pagination.total} RFQs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || pagination.page <= 1}
            onClick={() => void load(pagination.page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || pagination.page >= pagination.totalPages}
            onClick={() => void load(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <RfqStepsCard steps={rfqSteps} />
    </div>
  )
}
