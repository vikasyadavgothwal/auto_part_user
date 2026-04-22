import { Card, CardContent } from "@/components/ui/card"

type RfqStep = {
  title: string
  description: string
}

type RfqStepsCardProps = {
  steps: RfqStep[]
}

export function RfqStepsCard({ steps }: RfqStepsCardProps) {
  return (
    <Card className="rounded-sm border border-border bg-brand-panel">
      <CardContent className="p-6">
        <h3 className="mb-2 font-semibold text-foreground">How RFQs Work</h3>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title}>
              <div className="mb-2 font-bold text-primary">{step.title}</div>
              <p className="text-sm text-brand-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
