"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authenticatedFetch } from "@/lib/auth/client"
import type { DashboardUser } from "@/lib/auth/types"
import { appRoutes, withBasePath } from "@/lib/routes"
import {
  getVehicleDisplayName,
  type VehicleRecord,
} from "@/lib/vehicles"

type Step = 1 | 2 | 3

type PartItem = {
  id: number
  partName: string
  partNumber: string
  quantity: number
  targetPrice: string
  notes: string
}

type VehicleDetails = {
  year: string
  make: string
  model: string
  trim: string
  vin: string
}

type VehiclesApiResponse = {
  ok: boolean
  vehicles?: VehicleRecord[]
  message?: string
}

const newPart = (id: number): PartItem => ({
  id,
  partName: "",
  partNumber: "",
  quantity: 1,
  targetPrice: "",
  notes: "",
})

const defaultDeadline = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

const digitsOnly = (value: string) => value.replace(/\D/g, "")

const decimalOnly = (value: string) => {
  const normalized = value.replace(/[^\d.]/g, "")
  if (!/\d/.test(normalized)) return ""
  const [whole, ...decimalParts] = normalized.split(".")
  return decimalParts.length ? `${whole}.${decimalParts.join("").slice(0, 2)}` : whole
}

const userName = (user: DashboardUser) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ") ||
  user.companyName ||
  user.email ||
  "Customer"

export function CreateRfqPage({ user }: { user: DashboardUser }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [parts, setParts] = useState<PartItem[]>([newPart(1)])
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [vehicle, setVehicle] = useState<VehicleDetails>({
    year: "",
    make: "",
    model: "",
    trim: "",
    vin: "",
  })
  const [projectName, setProjectName] = useState("Parts request")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState(defaultDeadline)
  const deliveryRequirement = "Standard Delivery"
  const paymentTerms = "Due on Receipt"
  const [companyName, setCompanyName] = useState(user.companyName || userName(user))
  const [contactName, setContactName] = useState(userName(user))
  const [email, setEmail] = useState(user.email || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    authenticatedFetch(withBasePath("/api/vehicles?page=1&pageSize=50"))
      .then(async (response) => {
        const payload = (await response.json()) as VehiclesApiResponse
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Unable to load vehicles")
        }
        const savedVehicles = payload.vehicles ?? []
        setVehicles(savedVehicles)
        const primaryVehicle = savedVehicles.find((item) => item.primary) ?? savedVehicles[0]
        if (primaryVehicle) {
          setSelectedVehicleId(primaryVehicle.id)
          setVehicle({
            year: primaryVehicle.year,
            make: primaryVehicle.make,
            model: primaryVehicle.model,
            trim: "",
            vin: primaryVehicle.vin,
          })
        }
      })
      .catch((caught) => {
        setSubmitError(caught instanceof Error ? caught.message : "Unable to load vehicles")
      })
  }, [])

  const totalQuantity = useMemo(
    () => parts.reduce((sum, part) => sum + (Number(part.quantity) || 0), 0),
    [parts],
  )

  const canContinueStep1 = parts.every(
    (part) => part.partName.trim() && Number(part.quantity) > 0,
  )
  const canContinueStep2 =
    projectName.trim() &&
    deadline.trim() &&
    vehicle.year.trim() &&
    vehicle.make.trim() &&
    vehicle.model.trim() &&
    companyName.trim() &&
    contactName.trim() &&
    email.trim() &&
    phone.trim()

  function selectVehicle(vehicleId: string) {
    setSelectedVehicleId(vehicleId)
    const savedVehicle = vehicles.find((item) => item.id === vehicleId)
    if (!savedVehicle) return
    setVehicle({
      year: savedVehicle.year,
      make: savedVehicle.make,
      model: savedVehicle.model,
      trim: "",
      vin: savedVehicle.vin,
    })
  }

  function updatePart(id: number, field: keyof PartItem, value: string | number) {
    setParts((current) =>
      current.map((part) => (part.id === id ? { ...part, [field]: value } : part)),
    )
  }

  function removePart(id: number) {
    setParts((current) =>
      current.length === 1 ? current : current.filter((part) => part.id !== id),
    )
  }

  function addPart() {
    setParts((current) => [...current, newPart(Date.now())])
  }

  function handleNext() {
    if (step === 1 && canContinueStep1) setStep(2)
    if (step === 2 && canContinueStep2) setStep(3)
  }

  function handleBack() {
    if (step === 2) setStep(1)
    if (step === 3) setStep(2)
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const payload = {
        source: "user",
        userVehicleId: selectedVehicleId || undefined,
        projectName,
        description,
        responseDeadline: new Date(`${deadline}T23:59:59`).toISOString(),
        deliveryRequirement,
        paymentTerms,
        companyName,
        contactName,
        email,
        phone,
        vehicle,
        parts: parts.map((part) => ({
          partName: part.partName,
          partNumber: part.partNumber,
          quantity: part.quantity,
          targetPrice: part.targetPrice,
          notes: part.notes,
        })),
      }
      const body = new FormData()
      body.set("payload", JSON.stringify(payload))
      if (attachment) body.set("attachment", attachment)

      const response = await authenticatedFetch(withBasePath("/api/rfqs"), {
        method: "POST",
        body,
      })
      const result = (await response.json()) as {
        ok: boolean
        message?: string
        rfq?: { publicId?: string }
      }
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to submit RFQ")
      }
      const created = result.rfq?.publicId
        ? `?created=${encodeURIComponent(result.rfq.publicId)}`
        : "?created=1"
      router.push(`${appRoutes.rfqs}${created}`)
      router.refresh()
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : "Unable to submit RFQ")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Create RFQ</h1>
        <p className="text-brand-muted">
          Send part requirements to suppliers and compare quotations in your RFQ page.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Parts"],
          ["2", "Details"],
          ["3", "Review"],
        ].map(([id, label]) => {
          const active = Number(id) === step
          return (
            <div
              key={id}
              className={`rounded-sm border p-4 ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-brand-panel text-brand-muted"
              }`}
            >
              <div className="text-sm font-medium">Step {id}</div>
              <div className="mt-1 text-lg font-semibold">{label}</div>
            </div>
          )
        })}
      </div>

      {submitError ? (
        <p className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      {step === 1 ? (
        <Card className="rounded-sm border-border bg-brand-panel">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Add parts</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Add one or more parts you want suppliers to quote.
              </p>
            </div>

            <div className="space-y-4">
              {parts.map((part, index) => (
                <div
                  key={part.id}
                  className="rounded-sm border border-border bg-brand-surface p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="font-semibold text-foreground">Part {index + 1}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={parts.length === 1}
                      onClick={() => removePart(part.id)}
                      aria-label="Remove part"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <Label>Part Name *</Label>
                      <Input
                        value={part.partName}
                        onChange={(event) => updatePart(part.id, "partName", event.target.value)}
                        placeholder="Brake pads"
                        className="h-10 border-border bg-brand-panel"
                      />
                    </label>
                    <label className="space-y-2">
                      <Label>Part Number</Label>
                      <Input
                        value={part.partNumber}
                        onChange={(event) => updatePart(part.id, "partNumber", event.target.value)}
                        placeholder="BC1259"
                        className="h-10 border-border bg-brand-panel"
                      />
                    </label>
                    <label className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={part.quantity}
                        onChange={(event) =>
                          updatePart(
                            part.id,
                            "quantity",
                            Number(digitsOnly(event.target.value)) || 1,
                          )
                        }
                        className="h-10 border-border bg-brand-panel"
                      />
                    </label>
                    <label className="space-y-2">
                      <Label>Target Price</Label>
                      <Input
                        inputMode="decimal"
                        value={part.targetPrice}
                        onChange={(event) =>
                          updatePart(part.id, "targetPrice", decimalOnly(event.target.value))
                        }
                        placeholder="125"
                        className="h-10 border-border bg-brand-panel"
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <Label>Notes</Label>
                      <Input
                        value={part.notes}
                        onChange={(event) => updatePart(part.id, "notes", event.target.value)}
                        placeholder="Brand preference, warranty requirement, or other details"
                        className="h-10 border-border bg-brand-panel"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full gap-2 border-dashed"
              onClick={addPart}
            >
              <Plus className="h-4 w-4" />
              Add Another Part
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="rounded-sm border-border bg-brand-panel">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">RFQ details</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Select a saved vehicle or enter the vehicle information for this request.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <Label>Saved Vehicle</Label>
                <select
                  value={selectedVehicleId}
                  onChange={(event) => selectVehicle(event.target.value)}
                  className="h-10 w-full rounded-sm border border-border bg-brand-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary"
                >
                  <option value="">Enter manually</option>
                  {vehicles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getVehicleDisplayName(item)} · {item.vin}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <Label>Project Name *</Label>
                <Input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2">
                <Label>Response Deadline *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="h-10 border-border bg-brand-surface pl-9"
                  />
                </div>
              </label>
              <label className="space-y-2">
                <Label>Vehicle Year *</Label>
                <Input
                  inputMode="numeric"
                  value={vehicle.year}
                  onChange={(event) => setVehicle({ ...vehicle, year: event.target.value })}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2">
                <Label>Make *</Label>
                <Input
                  value={vehicle.make}
                  onChange={(event) => setVehicle({ ...vehicle, make: event.target.value })}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2">
                <Label>Model *</Label>
                <Input
                  value={vehicle.model}
                  onChange={(event) => setVehicle({ ...vehicle, model: event.target.value })}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2">
                <Label>Trim</Label>
                <Input
                  value={vehicle.trim}
                  onChange={(event) => setVehicle({ ...vehicle, trim: event.target.value })}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <Label>VIN</Label>
                <Input
                  value={vehicle.vin}
                  onChange={(event) =>
                    setVehicle({ ...vehicle, vin: event.target.value.toUpperCase() })
                  }
                  className="h-10 border-border bg-brand-surface uppercase"
                />
              </label>
              <label className="space-y-2">
                <Label>Customer / Company *</Label>
                <Input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2">
                <Label>Contact Name *</Label>
                <Input
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-sm border border-border bg-brand-surface px-3 py-2 text-sm outline-none focus-visible:border-primary"
                  placeholder="Any extra fitment, brand, warranty, or delivery details"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <Label>Attachment</Label>
                <Input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                  className="h-10 border-border bg-brand-surface"
                />
              </label>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="rounded-sm border-border bg-brand-panel">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Review RFQ</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Confirm the request before sending it to suppliers.
              </p>
            </div>
            <div className="grid gap-4 rounded-sm border border-border bg-brand-surface p-4 text-sm md:grid-cols-2">
              <p>
                <span className="text-brand-muted">Project:</span> {projectName}
              </p>
              <p>
                <span className="text-brand-muted">Deadline:</span> {deadline}
              </p>
              <p>
                <span className="text-brand-muted">Vehicle:</span>{" "}
                {[vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
                  .filter(Boolean)
                  .join(" ")}
              </p>
              <p>
                <span className="text-brand-muted">VIN:</span> {vehicle.vin || "-"}
              </p>
              <p>
                <span className="text-brand-muted">Line items:</span> {parts.length}
              </p>
              <p>
                <span className="text-brand-muted">Total quantity:</span> {totalQuantity}
              </p>
            </div>
            <div className="space-y-3">
              {parts.map((part) => (
                <div
                  key={part.id}
                  className="rounded-sm border border-border bg-brand-surface p-4 text-sm"
                >
                  <div className="font-semibold text-foreground">{part.partName}</div>
                  <div className="mt-1 text-brand-muted">
                    Part #: {part.partNumber || "-"} · Qty {part.quantity}
                    {part.targetPrice ? ` · Target AED ${part.targetPrice}` : ""}
                  </div>
                  {part.notes ? <div className="mt-2 text-brand-muted">{part.notes}</div> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1 || isSubmitting}
          onClick={handleBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {step < 3 ? (
          <Button
            type="button"
            disabled={step === 1 ? !canContinueStep1 : !canContinueStep2}
            onClick={handleNext}
            className="gap-2 bg-primary text-primary-foreground hover:bg-brand-primary-hover"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
            className="bg-primary text-primary-foreground hover:bg-brand-primary-hover"
          >
            {isSubmitting ? "Submitting..." : "Submit RFQ to Suppliers"}
          </Button>
        )}
      </div>
    </div>
  )
}
