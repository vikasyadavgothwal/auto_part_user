"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { RfqAddressSection } from "@/components/dashboard/rfqs/rfq-address-section"
import { RfqAttachmentsSection } from "@/components/dashboard/rfqs/rfq-attachments-section"
import { RfqPartsSection } from "@/components/dashboard/rfqs/rfq-parts-section"
import {
  RfqReviewSubmitSection,
  RfqSubmitNavigation,
} from "@/components/dashboard/rfqs/rfq-review-submit-section"
import { RfqVehicleSection } from "@/components/dashboard/rfqs/rfq-vehicle-section"
import { readApiResponse } from "@/lib/api-response"
import { authenticatedFetch } from "@/lib/auth/client"
import type { DashboardUser } from "@/lib/auth/types"
import { appRoutes, withBasePath } from "@/lib/routes"
import type { VehicleRecord } from "@/lib/vehicles"

type Step = 1 | 2 | 3

type PartItem = {
  id: number
  vin?: string
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

type RfqImportResponse = {
  ok: boolean
  vin?: string
  vins?: string[]
  parts?: Array<Omit<PartItem, "id" | "notes">>
  vehicles?: Array<{ vin: string; year: number; make: string; model: string }>
  message?: string
}

type FieldErrors = Record<string, string>

const maxParts = 20

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
  const [submitError, setSubmitError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importedVehicles, setImportedVehicles] = useState<Array<{ vin: string; year: number; make: string; model: string }>>([])
  const [saveResolvedVehicles, setSaveResolvedVehicles] = useState(false)

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
  const importedVehicleCount = useMemo(
    () => new Set(parts.map((part) => part.vin).filter(Boolean)).size,
    [parts],
  )
  const vehicleAssignmentComplete = Boolean(selectedVehicleId) || parts.every(
    (part) => /^[A-HJ-NPR-Z0-9]{17}$/.test(part.vin ?? ""),
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
      if (!selectedVehicleId && !part.vin) {
        errors[partErrorKey(part.id, "vin")] = "Enter a VIN because no saved vehicle is selected"
      } else if (part.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(part.vin.trim().toUpperCase())) {
        errors[partErrorKey(part.id, "vin")] = "VIN must contain exactly 17 valid characters"
      }
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
    if (importedVehicleCount <= 1) {
      addVehicleYearError(errors, "vehicle.year", vehicle.year)
      addTextError(errors, "vehicle.make", vehicle.make, "Make", 80)
      addTextError(errors, "vehicle.model", vehicle.model, "Model", 80)
      addTextError(errors, "vehicle.trim", vehicle.trim, "Trim", 80, false)
      addVinError(errors, "vehicle.vin", vehicle.vin)
    }
    addTextError(errors, "companyName", companyName, "Customer / company", 120)
    addTextError(errors, "contactName", contactName, "Contact name", 120)
    addEmailError(errors, "email", email)
    addPhoneError(errors, "phone", phone)
    addTextError(errors, "description", description, "Description", 1000, false)

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
      const message = `An RFQ can include up to ${maxParts} parts.`
      setSubmitError(message)
      toast.error(message)
      return
    }
    setSubmitError("")
    setParts((current) => [...current, newPart(Date.now())])
  }

  async function importRfqFile(file: File | undefined) {
    if (!file) return
    setIsImporting(true)
    setSubmitError("")
    try {
      const body = new FormData()
      body.set("file", file)
      const response = await authenticatedFetch(withBasePath("/api/rfqs/import"), { method: "POST", body })
      const result = await readApiResponse<RfqImportResponse>(response, "Unable to import RFQ file")
      if (!result.vin || !result.parts?.length) throw new Error("The RFQ file does not contain valid parts")
      const matchedVehicle = vehicles.find((item) => item.vin.toUpperCase() === result.vin)
      if (matchedVehicle) selectVehicle(matchedVehicle.id)
      else {
        const resolvedVehicle = result.vehicles?.find((item) => item.vin === result.vin)
        if (!resolvedVehicle) throw new Error(`We could not find VIN ${result.vin}. Remove or correct it, then upload again.`)
        setSelectedVehicleId("")
        setVehicle({ year: String(resolvedVehicle.year), make: resolvedVehicle.make, model: resolvedVehicle.model, trim: "", vin: resolvedVehicle.vin })
      }
      setImportedVehicles(result.vehicles ?? [])
      setParts(result.parts.map((part, index) => ({ ...part, id: Date.now() + index, notes: "" })))
      setFieldErrors({})
      toast.success("RFQ file imported successfully")
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to import RFQ file"
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsImporting(false)
    }
  }

  async function resolveManualVins() {
    const vins = Array.from(new Set(parts.map((part) => part.vin?.trim().toUpperCase()).filter((vin): vin is string => Boolean(vin))))
    const resolved = [...importedVehicles]
    for (const vin of vins) {
      if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) throw new Error(`VIN ${vin} must contain exactly 17 valid characters.`)
      if (vehicles.some((item) => item.vin.toUpperCase() === vin) || resolved.some((item) => item.vin === vin)) continue
      const response = await authenticatedFetch(withBasePath(`/api/vehicles/vin-lookup?vin=${encodeURIComponent(vin)}`))
      const payload = await readApiResponse<{ ok: boolean; found?: boolean; vehicle?: { vin: string; year: number; make: string; model: string }; message?: string }>(response, `Unable to validate VIN ${vin}`)
      if (!payload.found || !payload.vehicle) throw new Error(`VIN ${vin} was not found in our database or VIN provider. Correct it before continuing.`)
      resolved.push(payload.vehicle)
    }
    setImportedVehicles(resolved)
    if (!selectedVehicleId && resolved[0]) {
      setVehicle({ year: String(resolved[0].year), make: resolved[0].make, model: resolved[0].model, trim: "", vin: resolved[0].vin })
    }
    return resolved
  }

  async function handleNext() {
    const errors = step === 1 ? validateParts() : validateDetails()
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      const message = "Fix the highlighted fields before continuing."
      setSubmitError(message)
      toast.error(message)
      return
    }
    setSubmitError("")
    if (step === 1) {
      setIsImporting(true)
      try {
        await resolveManualVins()
        setStep(2)
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Unable to validate VIN"
        setSubmitError(message)
        toast.error(message)
      }
      finally { setIsImporting(false) }
    }
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
      const message = "Fix the highlighted fields before submitting."
      setSubmitError(message)
      toast.error(message)
      return
    }

    setIsSubmitting(true)
    try {
      const resolvedVehicles = await resolveManualVins()
      const importedVins = Array.from(new Set(parts.map((part) => part.vin?.trim().toUpperCase()).filter((vin): vin is string => Boolean(vin))))
      const selectedVin = vehicle.vin.trim().toUpperCase()
      const batchVins = Array.from(new Set([...importedVins, ...(parts.some((part) => !part.vin) && selectedVin ? [selectedVin] : [])]))
      if (!batchVins.length) throw new Error("Select a saved vehicle or enter a valid VIN for each part.")
      if (saveResolvedVehicles) for (const item of resolvedVehicles.filter((candidate) => !vehicles.some((saved) => saved.vin.toUpperCase() === candidate.vin))) {
        const response = await authenticatedFetch(withBasePath("/api/vehicles"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ year: String(item.year), make: item.make, model: item.model, vin: item.vin, mileage: "0", status: "Active", primary: false }) })
        if (!response.ok) { const payload = await response.json() as { message?: string }; if (!payload.message?.includes("already exists")) throw new Error(payload.message ?? `Unable to save ${item.vin}`) }
      }
      const primaryVin = batchVins[0]
      const primaryVehicle = vehicles.find((item) => item.vin.toUpperCase() === primaryVin)
        ?? resolvedVehicles.find((item) => item.vin === primaryVin)
        ?? vehicle
      const payload = {
        source: "user",
        userVehicleId: batchVins.length === 1 ? (primaryVehicle && "id" in primaryVehicle ? primaryVehicle.id : selectedVehicleId || undefined) : undefined,
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
          year: digitsOnly(String(primaryVehicle.year)),
          make: cleanText(primaryVehicle.make),
          model: cleanText(primaryVehicle.model),
          trim: "trim" in primaryVehicle ? cleanText(primaryVehicle.trim) : "",
          vin: primaryVehicle.vin.trim().toUpperCase(),
        },
        parts: parts.map((part) => ({
          vehicleVin: part.vin?.trim().toUpperCase() || selectedVin,
          partName: cleanText(part.partName),
          partNumber: cleanText(part.partNumber),
          quantity: part.quantity,
          targetPrice: part.targetPrice,
          notes: cleanText(part.notes),
        })),
      }
      const body = new FormData()
      body.set("payload", JSON.stringify(payload))
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
      toast.success("RFQ created successfully")
      router.push(`${appRoutes.rfqs}${created}`)
      router.refresh()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to submit RFQ"
      setSubmitError(message)
      toast.error(message)
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
          ["1", "Vehicles & Parts"],
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
        <RfqVehicleSection
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          isImporting={isImporting}
          fieldError={fieldError}
          selectVehicle={selectVehicle}
          importRfqFile={importRfqFile}
        >
          <RfqPartsSection
            parts={parts}
            selectedVehicleId={selectedVehicleId}
            importedVehicleCount={importedVehicleCount}
            saveResolvedVehicles={saveResolvedVehicles}
            maxParts={maxParts}
            fieldErrors={fieldErrors}
            fieldError={fieldError}
            partErrorKey={partErrorKey}
            digitsOnly={digitsOnly}
            decimalOnly={decimalOnly}
            updatePart={updatePart}
            removePart={removePart}
            addPart={addPart}
            setSaveResolvedVehicles={setSaveResolvedVehicles}
          />
        </RfqVehicleSection>
      ) : null}

      {step === 2 ? (
        <>
          <RfqAddressSection
            importedVehicleCount={importedVehicleCount}
            selectedVehicleId={selectedVehicleId}
            vehicles={vehicles}
            projectName={projectName}
            deadline={deadline}
            vehicle={vehicle}
            companyName={companyName}
            contactName={contactName}
            email={email}
            phone={phone}
            description={description}
            fieldErrors={fieldErrors}
            fieldError={fieldError}
            clearError={clearError}
            digitsOnly={digitsOnly}
            selectVehicle={selectVehicle}
            updateVehicle={updateVehicle}
            setProjectName={setProjectName}
            setDeadline={setDeadline}
            setCompanyName={setCompanyName}
            setContactName={setContactName}
            setEmail={setEmail}
            setPhone={setPhone}
            setDescription={setDescription}
          />
          <RfqAttachmentsSection />
        </>
      ) : null}

      {step === 3 ? (
        <RfqReviewSubmitSection
          projectName={projectName}
          deadline={deadline}
          vehicle={vehicle}
          parts={parts}
          totalQuantity={totalQuantity}
        />
      ) : null}

      <RfqSubmitNavigation
        step={step}
        isSubmitting={isSubmitting}
        vehicleAssignmentComplete={vehicleAssignmentComplete}
        handleBack={handleBack}
        handleNext={handleNext}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}
