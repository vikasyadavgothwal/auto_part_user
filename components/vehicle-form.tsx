"use client"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RequiredMark } from "@/components/ui/required-mark"
import { cn } from "@/lib/utils"
import {
  emptyVehicleFormValues,
  type VehicleFormValues,
  type VehicleStatus,
} from "@/lib/vehicles"
const vehicleStatusOptions: VehicleStatus[] = [
  "Active",
  "In Service",
  "Inactive",
]

type VehicleFormProps = {
  initialValues?: VehicleFormValues
  submitLabel: string
  onSubmit: (values: VehicleFormValues) => void
  onCancel?: () => void
  className?: string
  onVinLookup?: (vin: string) => Promise<{ found: boolean; year?: number; make?: string; model?: string; message?: string }>
}

type VehicleFormErrors = Partial<Record<keyof VehicleFormValues, string>>

const currentVehicleYear = new Date().getFullYear() + 1
const minMileage = 1
const maxMileage = 70
const vehicleStatusSet = new Set<VehicleStatus>(vehicleStatusOptions)
const digitsOnly = (value: string) => value.replace(/\D/g, "")
const vinInput = (value: string) =>
  value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17)
const hasAlphanumeric = (value: string) => /[\p{L}\p{N}]/u.test(value)

function validateVehicleForm(values: VehicleFormValues) {
  const nextValues: VehicleFormValues = {
    year: digitsOnly(values.year).slice(0, 4),
    make: values.make.trim().replace(/\s+/g, " "),
    model: values.model.trim().replace(/\s+/g, " "),
    vin: vinInput(values.vin),
    mileage: digitsOnly(values.mileage).slice(0, 7),
    status: vehicleStatusSet.has(values.status) ? values.status : "Active",
    primary: Boolean(values.primary),
  }
  const errors: VehicleFormErrors = {}
  const parsedYear = Number(nextValues.year)
  const parsedMileage = Number(nextValues.mileage)

  if (!nextValues.year) {
    errors.year = "Vehicle year is required"
  } else if (
    !/^\d{4}$/.test(nextValues.year) ||
    parsedYear < 1886 ||
    parsedYear > currentVehicleYear
  ) {
    errors.year = `Vehicle year must be between 1886 and ${currentVehicleYear}`
  }

  if (!nextValues.make) {
    errors.make = "Make is required"
  } else if (!hasAlphanumeric(nextValues.make)) {
    errors.make = "Make must include letters or numbers"
  } else if (nextValues.make.length > 80) {
    errors.make = "Make must be 80 characters or fewer"
  }

  if (!nextValues.model) {
    errors.model = "Model is required"
  } else if (!hasAlphanumeric(nextValues.model)) {
    errors.model = "Model must include letters or numbers"
  } else if (nextValues.model.length > 80) {
    errors.model = "Model must be 80 characters or fewer"
  }

  if (!nextValues.vin) {
    errors.vin = "VIN is required"
  } else if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(nextValues.vin)) {
    errors.vin = "VIN must be exactly 17 characters and cannot include I, O, or Q"
  }

  if (!nextValues.mileage) {
    errors.mileage = "Mileage is required"
  } else if (
    !Number.isInteger(parsedMileage) ||
    parsedMileage < minMileage ||
    parsedMileage > maxMileage
  ) {
    errors.mileage = `Mileage must be a whole number between ${minMileage} and ${maxMileage.toLocaleString()}`
  }

  if (!vehicleStatusSet.has(nextValues.status)) {
    errors.status = "Select a valid vehicle status"
  }

  return { errors, values: nextValues }
}

export function VehicleForm({
  initialValues = emptyVehicleFormValues,
  submitLabel,
  onSubmit,
  onCancel,
  className,
  onVinLookup,
}: VehicleFormProps) {
  const [values, setValues] = useState<VehicleFormValues>(initialValues)
  const [errors, setErrors] = useState<VehicleFormErrors>({})
  const [isLookingUpVin, setIsLookingUpVin] = useState(false)
  const [vinResolved, setVinResolved] = useState(!onVinLookup)
  const [manualEntry, setManualEntry] = useState(!onVinLookup)
  const [vinMessage, setVinMessage] = useState("")

  async function lookupVin() {
    if (!onVinLookup) return
    const vin = vinInput(values.vin)
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      const message = "VIN must be exactly 17 characters and cannot include I, O, or Q"
      setErrors((current) => ({ ...current, vin: message }))
      toast.error(message)
      return
    }
    setIsLookingUpVin(true)
    setVinMessage("")
    try {
      const result = await onVinLookup(vin)
      if (result.found && result.year && result.make && result.model) {
        setValues((current) => ({ ...current, vin, year: String(result.year), make: result.make!, model: result.model! }))
        setVinResolved(true)
        setManualEntry(false)
        setVinMessage("Vehicle found. Year, make and model were filled automatically.")
        toast.success("Vehicle found successfully")
      } else {
        setVinResolved(true)
        setManualEntry(true)
        setVinMessage(result.message ?? "Vehicle details were not found. Check the VIN or enter them manually.")
      }
    } catch (error) {
      setVinResolved(true)
      setManualEntry(true)
      const message = error instanceof Error ? error.message : "Unable to look up VIN"
      setVinMessage(message)
      toast.error(message)
    } finally {
      setIsLookingUpVin(false)
    }
  }

  function updateValue<Key extends keyof VehicleFormValues>(
    key: Key,
    nextValue: VehicleFormValues[Key]
  ) {
    setErrors((currentErrors) => {
      if (!currentErrors[key]) return currentErrors
      const nextErrors = { ...currentErrors }
      delete nextErrors[key]
      return nextErrors
    })
    setValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }))
  }

  function errorText(key: keyof VehicleFormValues) {
    return errors[key] ? (
      <p className="text-xs font-medium text-destructive">{errors[key]}</p>
    ) : null
  }

  return (
    <form
      noValidate
      className={cn("space-y-6", className)}
      onSubmit={(event) => {
        event.preventDefault()
        const result = validateVehicleForm(values)
        if (Object.keys(result.errors).length) {
          setValues(result.values)
          setErrors(result.errors)
          toast.error(Object.values(result.errors)[0] ?? "Check the highlighted vehicle fields")
          return
        }
        setErrors({})
        onSubmit(result.values)
      }}
    >
      {onVinLookup ? (
        <div className="space-y-2 rounded-sm border border-border bg-brand-surface p-4">
          <Label htmlFor="vehicle-vin">VIN first<RequiredMark /></Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="vehicle-vin"
              placeholder="JT2BF22K6X0123456"
              value={values.vin}
              maxLength={17}
              required
              aria-invalid={Boolean(errors.vin)}
              onChange={(event) => {
                updateValue("vin", vinInput(event.target.value))
                setVinResolved(false)
                setManualEntry(false)
                setVinMessage("")
              }}
              className="h-10 border-border bg-brand-panel uppercase"
            />
            <Button type="button" disabled={isLookingUpVin || values.vin.length !== 17} onClick={() => void lookupVin()}>
              {isLookingUpVin ? "Searching..." : "Find Vehicle"}
            </Button>
          </div>
          {errorText("vin")}
          {vinMessage ? <p className="text-sm text-brand-muted">{vinMessage}</p> : null}
          {manualEntry && vinMessage ? (
            <p className="text-xs text-brand-muted">
              Enter the vehicle details below to save this VIN manually.
            </p>
          ) : null}
          {!vinResolved && vinMessage ? (
            <Button type="button" variant="outline" onClick={() => { setManualEntry(true); setVinResolved(true) }}>
              Enter details manually
            </Button>
          ) : null}
        </div>
      ) : null}

      {vinResolved ? <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="vehicle-year">Year<RequiredMark /></Label>
          <Input
            id="vehicle-year"
            inputMode="numeric"
            maxLength={4}
            required
            placeholder="2019"
            value={values.year}
            aria-invalid={Boolean(errors.year)}
            readOnly={Boolean(onVinLookup && !manualEntry)}
            onChange={(event) =>
              updateValue("year", digitsOnly(event.target.value).slice(0, 4))
            }
            className="h-10 border-border bg-brand-surface"
          />
          {errorText("year")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle-make">Make<RequiredMark /></Label>
          <Input
            id="vehicle-make"
            placeholder="Toyota"
            value={values.make}
            maxLength={80}
            required
            aria-invalid={Boolean(errors.make)}
            readOnly={Boolean(onVinLookup && !manualEntry)}
            onChange={(event) => updateValue("make", event.target.value)}
            className="h-10 border-border bg-brand-surface"
          />
          {errorText("make")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle-model">Model<RequiredMark /></Label>
          <Input
            id="vehicle-model"
            placeholder="Camry"
            value={values.model}
            maxLength={80}
            required
            aria-invalid={Boolean(errors.model)}
            readOnly={Boolean(onVinLookup && !manualEntry)}
            onChange={(event) => updateValue("model", event.target.value)}
            className="h-10 border-border bg-brand-surface"
          />
          {errorText("model")}
        </div>
      </div> : null}

      {vinResolved ? <div className="grid gap-4 md:grid-cols-2">
        {!onVinLookup ? <div className="space-y-2">
          <Label htmlFor="vehicle-vin">VIN<RequiredMark /></Label>
          <Input
            id="vehicle-vin"
            placeholder="JT2BF22K6X0123456"
            value={values.vin}
            maxLength={17}
            required
            aria-invalid={Boolean(errors.vin)}
            onChange={(event) => updateValue("vin", vinInput(event.target.value))}
            className="h-10 border-border bg-brand-surface uppercase"
          />
          {errorText("vin")}
        </div> : null}

        <div className="space-y-2">
          <Label htmlFor="vehicle-mileage">Mileage<RequiredMark /></Label>
          <Input
            id="vehicle-mileage"
            inputMode="numeric"
            placeholder="45234"
            value={values.mileage}
            maxLength={7}
            required
            aria-invalid={Boolean(errors.mileage)}
            onChange={(event) =>
              updateValue("mileage", digitsOnly(event.target.value).slice(0, 7))
            }
            className="h-10 border-border bg-brand-surface"
          />
          {errorText("mileage")}
        </div>
      </div> : null}

      {vinResolved ? <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="vehicle-status">Status<RequiredMark /></Label>
          <select
            id="vehicle-status"
            value={values.status}
            aria-invalid={Boolean(errors.status)}
            required
            onChange={(event) =>
              updateValue("status", event.target.value as VehicleStatus)
            }
            className="h-10 w-full rounded-sm border border-border bg-brand-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary"
          >
            {vehicleStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errorText("status")}
        </div>

        <label className="flex min-h-10 items-center gap-3 rounded-sm border border-border bg-brand-surface px-4">
          <Checkbox
            checked={values.primary}
            onCheckedChange={(checked) =>
              updateValue("primary", checked === true)
            }
          />
          <div>
            <div className="text-sm font-medium text-foreground">
              Mark as primary vehicle
            </div>
            <div className="text-xs text-brand-muted">
              Your main vehicle for fitment and RFQ defaults.
            </div>
          </div>
        </label>
      </div> : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border bg-brand-surface text-foreground hover:bg-brand-panel-strong"
          >
            Cancel
          </Button>
        ) : null}

        <Button
          type="submit"
          disabled={!vinResolved || isLookingUpVin}
          className="bg-primary text-primary-foreground hover:bg-brand-primary-hover"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
