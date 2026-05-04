import Link from "next/link"
import { Plus } from "lucide-react"

import { RfqStats } from "@/components/dashboard/rfqs/rfq-stats"
import { RfqStepsCard } from "@/components/dashboard/rfqs/rfq-steps-card"
import { rfqs, rfqStats, rfqSteps } from "@/components/dashboard/rfqs/rfqs-data"
import { RfqsTable } from "@/components/dashboard/rfqs/rfqs-table"
import { Button } from "@/components/ui/button"

export function RfqsPage() {
  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My RFQs</h1>
          <p className="text-brand-muted">
            Request quotes and compare offers from multiple suppliers.
          </p>
        </div>

        <Button
          asChild
          className="h-auto w-full gap-2 rounded-sm bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Link href="/rfq">
            <Plus className="h-5 w-5" />
            Create RFQ
          </Link>
        </Button>
      </div>

      <RfqStats stats={rfqStats} />
      <RfqsTable rfqs={rfqs} />
      <RfqStepsCard steps={rfqSteps} />
    </div>
  )
}
