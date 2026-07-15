"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { readApiResponse } from "@/lib/api-response"
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

type RfqSubmitResponse = {
  ok: boolean
  message?: string
  rfq?: { publicId?: string }
}

type FieldErrors = Record<string, string>

const maxParts = 20
const maxAttachmentSize = 10 * 1024 * 1024
const allowedAttachmentTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
])

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
const cleanText = (value: string) => value.trim().replace(/\s+/g, " ")

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

const partErrorKey = (id: number, field: keyof PartItem) =>
  `part-${id}-${field}`

const currentVehicleYear = new Date().getFullYear() + 1

const addTextError = (
  errors: FieldErrors,
  key: string,
  value: string,
  label: string,
  maxLength: number,
  required = true,
) => {
  const normalized = cleanText(value)
  if (required && !normalized) {
    errors[key] = `${label} is required`
    return normalized
  }
  if (normalized.length > maxLength) {
    errors[key] = `${label} must be ${maxLength} characters or fewer`
  }
  return normalized
}

const addVehicleYearError = (
  errors: FieldErrors,
  key: string,
  value: string,
) => {
  const normalized = digitsOnly(value)
  const year = Number(normalized)
  if (!normalized) {
    errors[key] = "Vehicle year is required"
  } else if (
    !/^\d{4}$/.test(normalized) ||
    year < 1886 ||
    year > currentVehicleYear
  ) {
    errors[key] = `Vehicle year must be between 1886 and ${currentVehicleYear}`
  }
  return normalized
}

const addVinError = (
  errors: FieldErrors,
  key: string,
  value: string,
  required = false,
) => {
  const normalized = value.trim().toUpperCase()
  if (required && !normalized) {
    errors[key] = "VIN is required"
    return normalized
  }
  if (normalized && !/^[A-HJ-NPR-Z0-9]{17}$/.test(normalized)) {
    errors[key] = "VIN must be exactly 17 characters and cannot include I, O, or Q"
  }
  return normalized
}

const addEmailError = (errors: FieldErrors, key: string, value: string) => {
  const normalized = addTextError(errors, key, value, "Email", 180)
  if (normalized && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    errors[key] = "Enter a valid email address"
  }
  return normalized
}

const addPhoneError = (errors: FieldErrors, key: string, value: string) => {
  const normalized = addTextError(errors, key, value, "Phone", 20)
  if (normalized && !/^[+\d][\d\s()-]{6,20}$/.test(normalized)) {
    errors[key] = "Enter a valid phone number"
  }
  return normalized
}

const addDeadlineError = (errors: FieldErrors, key: string, value: string) => {
  const normalized = value.trim()
  const deadlineDate = new Date(`${normalized}T23:59:59`)
  if (!normalized) {
    errors[key] = "Response deadline is required"
  } else if (Number.isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
    errors[key] = "Response deadline must be in the future"
  }
  return normalized
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    authenticatedFetch(withBasePath("/api/vehicles?page=1&pageSize=50"))
      .then(async (response) => {
        const payload = await readApiResponse<VehiclesApiResponse>(
          response,
          "Unable to load vehicles",
        )
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

  function clearError(key: string) {
    setFieldErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function fieldError(key: string) {
    return fieldErrors[key] ? (
      <p className="text-xs font-medium text-destructive">{fieldErrors[key]}</p>
    ) : null
  }

  function validateParts() {
    const errors: FieldErrors = {}

    if (!parts.length) {
      errors.parts = "Add at least one part"
      return errors
    }
    if (parts.length > maxParts) {
      errors.parts = `An RFQ can include up to ${maxParts} parts`
    }

    parts.forEach((part) => {
      addTextError(
        errors,
        partErrorKey(part.id, "partName"),
        part.partName,
        "Part name",
        120,
      )
      addTextError(
        errors,
        partErrorKey(part.id, "partNumber"),
        part.partNumber,
        "Part number",
        80,
        false,
      )
      const quantity = Number(part.quantity)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        errors[partErrorKey(part.id, "quantity")] =
          "Quantity must be between 1 and 999"
      }
      if (part.targetPrice) {
        const targetPrice = Number(part.targetPrice)
        if (
          !/^\d+(\.\d{1,2})?$/.test(part.targetPrice) ||
          !Number.isFinite(targetPrice) ||
          targetPrice < 0 ||
          targetPrice > 999999.99
        ) {
          errors[partErrorKey(part.id, "targetPrice")] =
            "Target price must be a valid amount up to AED 999,999.99"
        }
      }
      addTextError(
        errors,
        partErrorKey(part.id, "notes"),
        part.notes,
        "Notes",
        500,
        false,
      )
    })

    return errors
  }

  function validateDetails() {
    const errors: FieldErrors = {}
    addTextError(errors, "projectName", projectName, "Project name", 120)
    addDeadlineError(errors, "deadline", deadline)
    addVehicleYearError(errors, "vehicle.year", vehicle.year)
    addTextError(errors, "vehicle.make", vehicle.make, "Make", 80)
    addTextError(errors, "vehicle.model", vehicle.model, "Model", 80)
    addTextError(errors, "vehicle.trim", vehicle.trim, "Trim", 80, false)
    addVinError(errors, "vehicle.vin", vehicle.vin)
    addTextError(errors, "companyName", companyName, "Customer / company", 120)
    addTextError(errors, "contactName", contactName, "Contact name", 120)
    addEmailError(errors, "email", email)
    addPhoneError(errors, "phone", phone)
    addTextError(errors, "description", description, "Description", 1000, false)

    if (attachment) {
      if (!allowedAttachmentTypes.has(attachment.type)) {
        errors.attachment = "Attachment must be a PDF, PNG, or JPG file"
      } else if (attachment.size > maxAttachmentSize) {
        errors.attachment = "Attachment must be 10 MB or smaller"
      }
    }

    return errors
  }

  function firstStepForErrors(errors: FieldErrors): Step {
    return Object.keys(errors).some((key) => key.startsWith("part-") || key === "parts")
      ? 1
      : 2
  }

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
    setFieldErrors((current) => {
      const next = { ...current }
      delete next["vehicle.year"]
      delete next["vehicle.make"]
      delete next["vehicle.model"]
      delete next["vehicle.trim"]
      delete next["vehicle.vin"]
      return next
    })
  }

  function updatePart(id: number, field: keyof PartItem, value: string | number) {
    clearError(partErrorKey(id, field))
    setParts((current) =>
      current.map((part) => (part.id === id ? { ...part, [field]: value } : part)),
    )
  }

  function updateVehicle(field: keyof VehicleDetails, value: string) {
    clearError(`vehicle.${field}`)
    setVehicle((current) => ({ ...current, [field]: value }))
  }

  function removePart(id: number) {
    setParts((current) =>
      current.length === 1 ? current : current.filter((part) => part.id !== id),
    )
  }

  function addPart() {
    if (parts.length >= maxParts) {
      setSubmitError(`An RFQ can include up to ${maxParts} parts.`)
      return
    }
    setSubmitError("")
    setParts((current) => [...current, newPart(Date.now())])
  }

  function handleNext() {
    const errors = step === 1 ? validateParts() : validateDetails()
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setSubmitError("Fix the highlighted fields before continuing.")
      return
    }
    setSubmitError("")
    if (step === 1) setStep(2)
    if (step === 2) setStep(3)
  }

  function handleBack() {
    if (step === 2) setStep(1)
    if (step === 3) setStep(2)
  }

  async function handleSubmit() {
    setSubmitError("")
    const errors = { ...validateParts(), ...validateDetails() }
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setStep(firstStepForErrors(errors))
      setSubmitError("Fix the highlighted fields before submitting.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        source: "user",
        userVehicleId: selectedVehicleId || undefined,
        projectName: cleanText(projectName),
        description: cleanText(description),
        responseDeadline: new Date(`${deadline}T23:59:59`).toISOString(),
        deliveryRequirement,
        paymentTerms,
        companyName: cleanText(companyName),
        contactName: cleanText(contactName),
        email: cleanText(email).toLowerCase(),
        phone: cleanText(phone),
        vehicle: {
          year: digitsOnly(vehicle.year),
          make: cleanText(vehicle.make),
          model: cleanText(vehicle.model),
          trim: cleanText(vehicle.trim),
          vin: vehicle.vin.trim().toUpperCase(),
        },
        parts: parts.map((part) => ({
          partName: cleanText(part.partName),
          partNumber: cleanText(part.partNumber),
          quantity: part.quantity,
          targetPrice: part.targetPrice,
          notes: cleanText(part.notes),
        })),
      }
      const body = new FormData()
      body.set("payload", JSON.stringify(payload))
      if (attachment) body.set("attachment", attachment)

      const response = await authenticatedFetch(withBasePath("/api/rfqs"), {
        method: "POST",
        body,
      })
      const result = await readApiResponse<RfqSubmitResponse>(
        response,
        "Unable to submit RFQ",
        { ok: true },
      )
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
              {fieldError("parts")}
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
                        maxLength={120}
                        aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "partName")])}
                        onChange={(event) => updatePart(part.id, "partName", event.target.value)}
                        placeholder="Brake pads"
                        className="h-10 border-border bg-brand-panel"
                      />
                      {fieldError(partErrorKey(part.id, "partName"))}
                    </label>
                    <label className="space-y-2">
                      <Label>Part Number</Label>
                      <Input
                        value={part.partNumber}
                        maxLength={80}
                        aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "partNumber")])}
                        onChange={(event) => updatePart(part.id, "partNumber", event.target.value)}
                        placeholder="BC1259"
                        className="h-10 border-border bg-brand-panel"
                      />
                      {fieldError(partErrorKey(part.id, "partNumber"))}
                    </label>
                    <label className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={part.quantity}
                        maxLength={3}
                        aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "quantity")])}
                        onChange={(event) =>
                          updatePart(
                            part.id,
                            "quantity",
                            Number(digitsOnly(event.target.value).slice(0, 3)) || 1,
                          )
                        }
                        className="h-10 border-border bg-brand-panel"
                      />
                      {fieldError(partErrorKey(part.id, "quantity"))}
                    </label>
                    <label className="space-y-2">
                      <Label>Target Price</Label>
                      <Input
                        inputMode="decimal"
                        value={part.targetPrice}
                        maxLength={10}
                        aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "targetPrice")])}
                        onChange={(event) =>
                          updatePart(part.id, "targetPrice", decimalOnly(event.target.value))
                        }
                        placeholder="125"
                        className="h-10 border-border bg-brand-panel"
                      />
                      {fieldError(partErrorKey(part.id, "targetPrice"))}
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <Label>Notes</Label>
                      <Input
                        value={part.notes}
                        maxLength={500}
                        aria-invalid={Boolean(fieldErrors[partErrorKey(part.id, "notes")])}
                        onChange={(event) => updatePart(part.id, "notes", event.target.value)}
                        placeholder="Brand preference, warranty requirement, or other details"
                        className="h-10 border-border bg-brand-panel"
                      />
                      {fieldError(partErrorKey(part.id, "notes"))}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full gap-2 border-dashed"
              disabled={parts.length >= maxParts}
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
                  maxLength={120}
                  aria-invalid={Boolean(fieldErrors.projectName)}
                  onChange={(event) => {
                    clearError("projectName")
                    setProjectName(event.target.value)
                  }}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("projectName")}
              </label>
              <label className="space-y-2">
                <Label>Response Deadline *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <Input
                    type="date"
                    value={deadline}
                    aria-invalid={Boolean(fieldErrors.deadline)}
                    onChange={(event) => {
                      clearError("deadline")
                      setDeadline(event.target.value)
                    }}
                    className="h-10 border-border bg-brand-surface pl-9"
                  />
                </div>
                {fieldError("deadline")}
              </label>
              <label className="space-y-2">
                <Label>Vehicle Year *</Label>
                <Input
                  inputMode="numeric"
                  value={vehicle.year}
                  maxLength={4}
                  aria-invalid={Boolean(fieldErrors["vehicle.year"])}
                  onChange={(event) =>
                    updateVehicle("year", digitsOnly(event.target.value).slice(0, 4))
                  }
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("vehicle.year")}
              </label>
              <label className="space-y-2">
                <Label>Make *</Label>
                <Input
                  value={vehicle.make}
                  maxLength={80}
                  aria-invalid={Boolean(fieldErrors["vehicle.make"])}
                  onChange={(event) => updateVehicle("make", event.target.value)}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("vehicle.make")}
              </label>
              <label className="space-y-2">
                <Label>Model *</Label>
                <Input
                  value={vehicle.model}
                  maxLength={80}
                  aria-invalid={Boolean(fieldErrors["vehicle.model"])}
                  onChange={(event) => updateVehicle("model", event.target.value)}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("vehicle.model")}
              </label>
              <label className="space-y-2">
                <Label>Trim</Label>
                <Input
                  value={vehicle.trim}
                  maxLength={80}
                  aria-invalid={Boolean(fieldErrors["vehicle.trim"])}
                  onChange={(event) => updateVehicle("trim", event.target.value)}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("vehicle.trim")}
              </label>
              <label className="space-y-2 md:col-span-2">
                <Label>VIN</Label>
                <Input
                  value={vehicle.vin}
                  maxLength={17}
                  aria-invalid={Boolean(fieldErrors["vehicle.vin"])}
                  onChange={(event) =>
                    updateVehicle(
                      "vin",
                      event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17),
                    )
                  }
                  className="h-10 border-border bg-brand-surface uppercase"
                />
                {fieldError("vehicle.vin")}
              </label>
              <label className="space-y-2">
                <Label>Customer / Company *</Label>
                <Input
                  value={companyName}
                  maxLength={120}
                  aria-invalid={Boolean(fieldErrors.companyName)}
                  onChange={(event) => {
                    clearError("companyName")
                    setCompanyName(event.target.value)
                  }}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("companyName")}
              </label>
              <label className="space-y-2">
                <Label>Contact Name *</Label>
                <Input
                  value={contactName}
                  maxLength={120}
                  aria-invalid={Boolean(fieldErrors.contactName)}
                  onChange={(event) => {
                    clearError("contactName")
                    setContactName(event.target.value)
                  }}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("contactName")}
              </label>
              <label className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={email}
                  maxLength={180}
                  aria-invalid={Boolean(fieldErrors.email)}
                  onChange={(event) => {
                    clearError("email")
                    setEmail(event.target.value)
                  }}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("email")}
              </label>
              <label className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  value={phone}
                  maxLength={20}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  onChange={(event) => {
                    clearError("phone")
                    setPhone(event.target.value)
                  }}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("phone")}
              </label>
              <label className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <textarea
                  value={description}
                  maxLength={1000}
                  aria-invalid={Boolean(fieldErrors.description)}
                  onChange={(event) => {
                    clearError("description")
                    setDescription(event.target.value)
                  }}
                  rows={4}
                  className="w-full resize-none rounded-sm border border-border bg-brand-surface px-3 py-2 text-sm outline-none focus-visible:border-primary"
                  placeholder="Any extra fitment, brand, warranty, or delivery details"
                />
                {fieldError("description")}
              </label>
              <label className="space-y-2 md:col-span-2">
                <Label>Attachment</Label>
                <Input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  aria-invalid={Boolean(fieldErrors.attachment)}
                  onChange={(event) => {
                    clearError("attachment")
                    setAttachment(event.target.files?.[0] ?? null)
                  }}
                  className="h-10 border-border bg-brand-surface"
                />
                {fieldError("attachment")}
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
            disabled={isSubmitting}
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
